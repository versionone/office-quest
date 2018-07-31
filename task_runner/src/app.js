const nodemailer = require('nodemailer');
const emailUser = process.env.EMAIL_USER || 'user';
const emailPass = process.env.EMAIL_PASS || 'pass';
const attachmentFilePath = 'C:\\Temp\\';

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';

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

        db.collection('participant_activity').find(participantActivityQuery, {projection: participantActivityProjection}).toArray().then(docs => {
            docs.forEach(participant_activity_doc => {

                const participantActivityId = participant_activity_doc._id.toString();
                const notificationQuery = {
                    participant_activity_id: participantActivityId,
                    participant_email: participant_activity_doc.participant_email,
                };
                db.collection('notification').findOne(notificationQuery, {projection: {_id: 1}}).then(doc => {
                    if (doc) return;

                    const notification = {
                        participant_activity_id: participantActivityId,
                        participant_email: participant_activity_doc.participant_email,
                        email: {
                            ...participant_activity_doc.email,
                        },
                        sent: false,
                    };

                    db.collection('notification').insertOne(notification).then(insertResult => {
                        console.log(`A new notification to email '${notification.participant_email}' was inserted for participant activity '${participantActivityId}'`);

                        const notificationId = insertResult.insertedId.toString();
                        const participantActivityUpdate = {
                            $set: {
                                state: ActivityState.ACTIVE,
                                notification_id: notificationId,
                            },
                        };
                        db.collection('participant_activity').updateOne({_id: ObjectId(participantActivityId)}, participantActivityUpdate).then(() => {
                            console.log(`Updated participant activity '${participantActivityId}' with notification _id '${notificationId}' and set to ACTIVE`);
                        }).catch(err => {
                            console.error(`Update participant activity failed because: ${err}`);
                        });
                    }).catch(err => {
                        console.error(`Insert into notification failed because: ${err}`);
                    });
                }).catch(err => {
                    console.error(`Find notification failed because: ${err}`);
                });
            })
        }).catch(err => {
            console.error(`Find participant activities failed because: ${err}`);
        });
    },

    processUnsentNotifications: () => {
        const notificationProjection = {
            _id: 1,
            participant_activity_id: 1,
            participant_email: 1,
            email: 1,
        };

        db.collection('notification').find({sent: false}, {projection: notificationProjection}).toArray().then(docs => {
            docs.forEach(doc => {
                app.sendEmailNotification(doc).then(() => {
                    const notificationUpdate = {
                        $set: {sent: true},
                    };
                    db.collection('notification').updateOne({_id: doc._id}, notificationUpdate).then(() => {
                        console.log(`Email sent to '${doc.participant_email}' for participant activity '${doc.participant_activity_id}' and updated notification ${doc._id.toString()} to sent`);
                    }).catch(err => {
                        console.error(`Update notification failed because: ${err}`);
                    });
                }).catch(err => {
                    console.error(`Send email failed because: ${err}`);
                });
            })
        })
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
            app.processUnsentNotifications();
        }, 10000);
    }
};
