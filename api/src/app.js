const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';
const ActivityState = {
  FUTURE: 0,
  STAGED: 32,
  ACTIVE: 64,
  COMPLETE: 128,
};

let setHeaders = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Content-Type', 'application/json');
    next();
};

const logError = (err, req, res, next) => {
    console.error('err.stack', err.stack);
    next(err);
};

const clientErrorHandler = (err, req, res, next) => {
    if (req.xhr) {
        res.status(500).json({ error: err });
    } else {
        next(err);
    }
};

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.render('error', { error: err });
};

app.use(bodyParser.json());
app.use(setHeaders);
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

let db;
let connectionOptions = { useNewUrlParser: true };
MongoClient.connect(MongodbUri, connectionOptions, (err, client) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = client.db();
    console.log('Database connection ready');

    // Initialize the app.
    const server = app.listen(process.env.PORT || 4201, () => {
        const port = server.address().port;
        console.log('App now running on port', port);
    });
});

app.get('/quests', (req, res) => {
    const questProjection = {
        _id: 1,
        name: 1,
    };
    db.collection('quest').find({}, {projection: questProjection}).toArray().then((docs) => {
        res.json(docs);
    }).catch(err => { throw err; });
});

app.post('/quest/join', (req, res) => {
    const participantQuery = {
        quest_id: req.body.questId,
        email: req.body.email
    };
    db.collection('participant').findOne(participantQuery).then((doc) => {
        if (doc) {
            console.log(`The participant email '${doc.email}' already exists for quest '${doc.quest_id}', return participant _id '${doc._id}'`);
            res.json({ _id: doc._id });
        } else {
            const newParticipant = {
                name: req.body.name,
                email: req.body.email,
                quest_id: req.body.questId
            };
            db.collection('participant').insertOne(newParticipant).then((insertResult) => {
                console.log(`A new participant with email '${newParticipant.email}' was inserted for quest '${newParticipant.quest_id}'`);
                newParticipant._id = insertResult.insertedId;

                const questQuery = {
                    _id: ObjectId(req.body.questId),
                };
                db.collection('quest').findOne(questQuery).then((doc) => {
                    if (doc) {
                        const activities = doc.activities.map(activity => {
                            return {
                                quest_id: doc._id.toString(),
                                participant_id: newParticipant._id.toString(),
                                state: ActivityState.FUTURE,
                                organizer_email: doc.organizer_email,
                                base_url: doc.base_url,
                                ...activity,
                                email: {
                                    ...activity.email
                                },
                            }
                        });
                        activities[0].state = ActivityState.STAGED;

                        db.collection('participant_activity').insertMany(activities).then((insertResult) => {
                            console.log(`'${insertResult.insertedCount}' participant activities were created, return participant _id '${newParticipant._id}'`);
                            res.json({ _id: newParticipant._id });
                        }).catch(err => { throw err; });
                    } else {
                        throw new Error(`A quest with _id '${req.body.questId}' was not found`);
                    }
                }).catch(err => { throw err; });
            }).catch(err => { throw err; });
        }
    }).catch(err => { throw err; });
});

app.get('/currentActivity', (req, res) => {
    const participantActivityQuery = {
        participant_id: req.query.participantId,
        state: ActivityState.ACTIVE,
    };

    const participantActivityProjection = {
        _id: 0,
        organizer_email : 1,
        base_url : 1,
        type : 1,
        message : 1,
        activity_url: 1,
        answer_url : 1,
    };

    db.collection('participant_activity').findOne(participantActivityQuery, {projection: participantActivityProjection}).then((doc) => {
        res.json(doc);
    }).catch(err => { throw err; });
});
