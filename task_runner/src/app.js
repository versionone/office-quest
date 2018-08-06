const nodemailer = require('nodemailer');
const log = require('simple-node-logger').createSimpleFileLogger('task_runner.log');
const log = require('simple-node-logger').createSimpleFileLogger('api.log');
const emailUser = process.env.EMAIL_USER || 'user';
const emailPass = process.env.EMAIL_PASS || 'pass';
const attachmentFilePath = 'C:\\Temp\\';

const MongoClient = require('mongodb').MongoClient;
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';

const ActivityState = {
    FUTURE: 0,
    STAGED: 32,
    NOTIFYING: 48,
    ACTIVE: 64,
    COMPLETE: 128,
};

const ActivityType = {
    GUI: 0,
    ONLINE: 1,
    SCRAMBLE: 2,
    HUNT: 3,
    TRIVIA: 99,
    NOTIFICATION: 100,
};

const CompletionType = {
  ANSWER: 0,
  MANUAL: 1,
  AUTOMATIC: 100,
};

let db;
let connectionOptions = { useNewUrlParser: true };
MongoClient.connect(mongodbUri, connectionOptions, (err, client) => {
    if (err) {
        log.error(err);
        process.exit(1);
    }

    db = client.db();
    log.info('Database connection ready');

    app.initialize();
});

const app = {
    processStagedActivities: () => {
        const participantActivityQuery = {
            type: {$ne: ActivityType.TRIVIA},
            state: ActivityState.STAGED,
            start_datetime: {$lte: new Date()},
        };

        const participantActivityProjection = {
            _id: 1,
            participant_id: 1,
            participant_email : 1,
            email : 1,
            completion_type: 1,
        };

        db.collection('participant_activity').findOne(participantActivityQuery, {projection: participantActivityProjection}).then(doc => {
            if (!doc) return;

            db.collection('participant_activity').updateOne({_id: doc._id}, {$set: {state: ActivityState.NOTIFYING}}).then(() => {
                log.info(`Sending email to notify participant '${doc.participant_id}' that participant activity ${doc._id} is now available (ACTIVE)`);
                app.sendEmailNotification(doc).then(() => {
                    if (doc.completion_type === CompletionType.AUTOMATIC) {
                        db.collection('participant_activity').updateOne({_id: doc._id}, {$set: {state: ActivityState.COMPLETE}}).then(() => {
                            const participantActivityUpdateFilter = {
                                participant_id: doc.participant_id,
                                state: ActivityState.FUTURE,
                            };

                            db.collection('participant_activity').updateOne(participantActivityUpdateFilter, {$set: {state: ActivityState.STAGED}}).then(() => {
                                log.info(`Updated next participant activity state to STAGED for participant '${doc.participant_id}'`);
                            }).catch(err => { throw err; });
                        }).catch(err => {
                            log.error(`Update participant activity '${doc._id.toString()}' state to COMPLETE failed because: ${err}`);
                        });
                    } else {
                        db.collection('participant_activity').updateOne({_id: doc._id}, {$set: {state: ActivityState.ACTIVE}}).then(() => {
                            log.info(`Updated participant activity ${doc._id} state to ACTIVE for participant '${doc.participant_id}'`);
                        }).catch(err => {
                            log.error(`Update participant activity '${doc._id.toString()}' state to ACTIVE failed because: ${err}`);
                        });
                    }
                }).catch(err => {
                    log.error(`Send email to '${doc.participant_email}' for participant activity '${doc._id.toString()}' failed because: ${err}`);
                });
            }).catch(err => {
                log.error(`Update participant activity '${doc._id.toString()}' state to NOTIFYING failed because: ${err}`);
            });
        }).catch(err => {
            log.error(`Find participant activity failed because: ${err}`);
        });
    },

    sendEmailNotification: (notification) => {
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        let mailOptions = {
            from: '"Mickey Rogers" <mrogers@collab.net>',
            to: notification.participant_email,
            subject: notification.email.subject,
            html: notification.email.message
        };

        if (notification.email.files_to_attach) {
            mailOptions.attachments = notification.email.files_to_attach.map((fileToAttach) => {
                return {
                    filename: fileToAttach,
                    path: attachmentFilePath.concat(fileToAttach),
                }
            })
        }

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) reject(err);
                else resolve(info);
            })
        })
    },

    initialize: () => {
        setInterval(() => {
            app.processStagedActivities();
        }, 5000);
    }
};
