const nodemailer = require('nodemailer');
const emailUser = process.env.EMAIL_USER || 'user';
const emailPass = process.env.EMAIL_PASS || 'pass';
const attachmentFilePath = 'C:\\Temp\\';

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongodbUri = process.env.MONGODB_URI || 'mongodb://test:Password1.@ds159641.mlab.com:59641/office_quest';

const ActivityState = {
    FUTURE: 0,
    STAGED: 32,
    NOTIFYING: 48,
    ACTIVE: 64,
    COMPLETE: 128,
};

let db;
let connectionOptions = { useNewUrlParser: true };
MongoClient.connect(mongodbUri, connectionOptions, (err, client) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = client.db();
    console.log('Database connection ready');

    app.initialize();
});

const app = {
    processStagedActivities: () => {
        const participantActivityQuery = {
            state: ActivityState.STAGED,
            start_datetime: {$lte: new Date()},
        };

        const participantActivityProjection = {
            _id: 1,
            participant_email : 1,
            email : 1,
        };

        db.collection('participant_activity').findOne(participantActivityQuery, {projection: participantActivityProjection}).then(doc => {
            if (!doc) return;

            db.collection('participant_activity').updateOne({_id: doc._id}, {$set: {state: ActivityState.NOTIFYING}}).then(() => {
                app.sendEmailNotification(doc).then(() => {
                    db.collection('participant_activity').updateOne({_id: doc._id}, {$set: {state: ActivityState.ACTIVE}}).then(() => {
                        // Nothing to do here...move along
                    }).catch(err => {
                        console.error(`Update participant activity '${doc._id.toString()}' state to ACTIVE failed because: ${err}`);
                    });
                }).catch(err => {
                    console.error(`Send email to '${doc.participant_email}' for participant activity '${doc._id.toString()}' failed because: ${err}`);
                });
            }).catch(err => {
                console.error(`Update participant activity '${doc._id.toString()}' state to NOTIFYING failed because: ${err}`);
            });
        }).catch(err => {
            console.error(`Find participant activity failed because: ${err}`);
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
