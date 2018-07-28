const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';
const ActivityState = {
    FUTURE: 0,
    STAGED: 32,
    ACTIVE: 64,
    COMPLETE: 128,
};

let db;
let connectionOptions = { useNewUrlParser: true };
MongoClient.connect(MongodbUri, connectionOptions, (err, client) => {
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
            participant_email : 1,
            email : 1,
        };

        db.collection('participant_activity').find(participantActivityQuery, {projection: participantActivityProjection}).toArray().then(docs => {
            docs.forEach(participant_activity_doc => {
                db.collection('notification').findOne().then(doc => {
                    if (doc) return;

                    const participantActivityId = participant_activity_doc._id.toString();
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
        db.collection('notification').find({sent: false}).toArray().then(docs => {
            docs.forEach(doc => {
                console.log(`Sending notification to '${doc.participant_email}' for participant activity '${doc.participant_activity_id}'`);
                // now actually send it wrapped in a promise or something

                const notificationUpdate = {
                    $set: {sent: true},
                };
                db.collection('notification').updateOne({_id: doc._id}, notificationUpdate).then(() => {
                    console.log(`Notification ${doc._id} was set to sent`);
                })
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
