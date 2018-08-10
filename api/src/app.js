const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const log = require('simple-node-logger').createSimpleFileLogger('api.log');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const MongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';
const hostAddress = 'localhost';
const hostPort = process.env.PORT || 4201;

const ActivityState = {
    FUTURE: 0,
    STAGED: 32,
    NOTIFYING: 48,
    ACTIVE: 64,
    COMPLETE: 128,
};

const CompletionType = {
    ANSWER: 0,
    MANUAL: 1,
    AUTOMATIC: 100,
};

let setHeaders = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Email, Password');
    res.header('Content-Type', 'application/json');
    next();
};

const logError = (err, req, res, next) => {
    log.error('err.stack: ', err.stack);
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
        log.error(err);
        process.exit(1);
    }

    db = client.db();
    log.info('Database connection ready');

    const server = app.listen(hostPort, hostAddress,() => {
        const port = server.address().port;
        log.info('App now running on port: ', port);
    });
});

app.get('/quests', (req, res) => {
    const questProjection = {
        _id: 1,
        name: 1,
    };
    db.collection('quest').find({}, {projection: questProjection}).toArray().then(docs => {
        res.json(docs);
    }).catch(err => { throw err; });
});

app.post('/quest/join', (req, res) => {
    const participantQuery = {
        quest_id: req.body.questId,
        email: req.body.email
    };

    const participantProjection = {
        _id: 1,
        quest_id: 1,
        email: 1,
    };

    db.collection('participant').findOne(participantQuery, {projection: participantProjection}).then(doc => {
        if (doc) {
            log.info(`The participant email '${doc.email}' already exists for quest '${doc.quest_id}', return participant _id '${doc._id}'`);
            res.json({ _id: doc._id });
        } else {
            const newParticipant = {
                name: req.body.name,
                email: req.body.email,
                quest_id: req.body.questId
            };
            db.collection('participant').insertOne(newParticipant).then(insertResult => {
                log.info(`A new participant with email '${newParticipant.email}' was inserted for quest '${newParticipant.quest_id}'`);
                newParticipant._id = insertResult.insertedId;

                const questQuery = {
                    _id: ObjectId(req.body.questId),
                };

                const questProjection = {
                    _id: 1,
                    app_url: 1,
                    activities: 1,
                };
                db.collection('quest').findOne(questQuery, {projection: questProjection}).then(doc => {
                    if (doc) {
                        const activities = doc.activities.map(activity => {
                            if (activity.email) activity.email.message = activity.email.message.replace('{{app_url}}', doc.app_url);
                            return {
                                quest_id: doc._id.toString(),
                                participant_id: newParticipant._id.toString(),
                                participant_name: req.body.name,
                                participant_email: req.body.email,
                                state: ActivityState.FUTURE,
                                ...activity,
                                email: {
                                    ...activity.email
                                },
                            }
                        });
                        activities[0].state = ActivityState.STAGED;

                        db.collection('participant_activity').insertMany(activities).then(insertResult => {
                            log.info(`'${insertResult.insertedCount}' participant activities were created, return participant _id '${newParticipant._id}'`);
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

app.get('/activity/current', (req, res) => {
    const participantActivityQuery = {
        participant_id: req.query.participantId,
        state: ActivityState.ACTIVE,
    };

    const participantActivityProjection = {
        _id: 1,
        type : 1,
        message : 1,
        faux: 1,
        choices: 1,
    };

    db.collection('participant_activity').findOne(participantActivityQuery, {projection: participantActivityProjection}).then(doc => {
        res.json(doc);
    }).catch(err => { throw err; });
});

app.get('/activity/next', (req, res) => {
    const participantActivityQuery = {
        participant_id: req.query.participantId,
        state: ActivityState.STAGED,
    };

    const participantActivityProjection = {
        _id: 0,
        start_datetime : 1,
    };

    db.collection('participant_activity').findOne(participantActivityQuery, {projection: participantActivityProjection}).then(doc => {
        res.json(doc);
    }).catch(err => { throw err; });
});

app.post('/activity/submitAnswer', (req, res) => {
    const participantActivityProjection = {
        state: 1,
        answer: 1
    };

    db.collection('participant_activity').findOne({_id: ObjectId(req.body.participantActivityId)}, {projection: participantActivityProjection}).then(doc => {
        if (doc) {
            if (doc.state !== ActivityState.ACTIVE) return;

            if (req.body.answer.toLowerCase() === doc.answer.toLowerCase()) {
                db.collection('participant_activity').updateOne({_id: ObjectId(req.body.participantActivityId)}, {$set: {state: ActivityState.COMPLETE}}).then(() => {
                    log.info(`Updated participant activity '${req.body.participantActivityId}' state to COMPLETE`);
                    const participantActivityUpdateFilter = {
                        participant_id: req.body.participantId,
                        state: ActivityState.FUTURE,
                    };

                    db.collection('participant_activity').updateOne(participantActivityUpdateFilter, {$set: {state: ActivityState.STAGED}}).then(() => {
                        log.info(`Updated next participant activity state to STAGED for participant '${req.body.participantId}'`);
                    }).catch(err => { throw err; });

                    res.json({isCorrectAnswer: true});
                }).catch(err => { throw err; });
            } else {
                res.json({isCorrectAnswer: false});
            }
        } else {
            throw new Error(`A participantActivity with _id '${req.body.participantActivityId}' was not found`);
        }
    }).catch(err => { throw err; });
});

app.post('/activity/submitChoice', (req, res) => {
    const participantActivityProjection = {
        state: 1,
        answer: 1
    };

    db.collection('participant_activity').findOne({_id: ObjectId(req.body.participantActivityId)}, {projection: participantActivityProjection}).then(doc => {
        if (doc) {
            if (doc.state !== ActivityState.ACTIVE) return;

            db.collection('participant_activity').updateOne({_id: ObjectId(req.body.participantActivityId)}, {$set: {state: ActivityState.COMPLETE}}).then(() => {
                log.info(`Updated participant activity '${req.body.participantActivityId}' state to COMPLETE`);

                if (req.body.answer.toLowerCase() === doc.answer.toLowerCase()) {
                    const participantActivityUpdateFilter = {
                        participant_id: req.body.participantId,
                        state: ActivityState.FUTURE,
                    };

                    db.collection('participant_activity').updateOne(participantActivityUpdateFilter, {$set: {state: ActivityState.STAGED}}).then(() => {
                        log.info(`Updated next participant activity state to STAGED for participant '${req.body.participantId}'`);
                    }).catch(err => { throw err; });

                    res.json({isCorrectAnswer: true});
                } else {
                    res.json({isCorrectAnswer: false});
                }
            }).catch(err => { throw err; });
        } else {
            throw new Error(`A participantActivity with _id '${req.body.participantActivityId}' was not found`);
        }
    }).catch(err => { throw err; });
});

app.post('/activity/submitKeys', (req, res) => {
    const participantActivityProjection = {
        state: 1,
        answer: 1
    };

    db.collection('participant_activity').findOne({_id: ObjectId(req.body.participantActivityId)}, {projection: participantActivityProjection}).then(doc => {
        if (doc) {
            if (doc.state !== ActivityState.ACTIVE) return;

            const correctKeys = [];

            req.body.answer.forEach((code, idx) => {
                if (doc.answer[idx] === code) {
                    correctKeys.push(code);
                }
            });

            if (correctKeys.length === doc.answer.length)
                db.collection('participant_activity').updateOne({_id: ObjectId(req.body.participantActivityId)}, {$set: {state: ActivityState.COMPLETE}}).then(() => {
                    const participantActivityUpdateFilter = {
                        participant_id: req.body.participantId,
                        state: ActivityState.FUTURE,
                    };

                    db.collection('participant_activity').updateOne(participantActivityUpdateFilter, {$set: {state: ActivityState.STAGED}}).then(() => {
                        log.info(`Updated next participant activity state to STAGED for participant '${req.body.participantId}'`);
                    }).catch(err => { throw err; });

                    res.json({isCorrectAnswer: true});
                }).catch(err => { throw err; });
            else {
                res.json({isCorrectAnswer: false});
            }
        } else {
            throw new Error(`A participantActivity with _id '${req.body.participantActivityId}' was not found`);
        }
    }).catch(err => { throw err; });
});


// Admin stuff
const isAuthorized = (email, password) => {
    return new Promise((resolve, reject) => {
        if (email && password) {
            const administratorQuery = {
                email: email,
                password: password,
            };

            log.info('administratorQuery: ', administratorQuery);
            db.collection('administrator').findOne(administratorQuery, {projection: {_id: 1}}).then(doc => {
                log.info('doc: ', doc);
                if (doc) {
                    resolve();
                } else {
                    log.warn(`An invalid authorization was attempted with email: ${email} and password: ${password}`);
                    reject('Ah, ah, ah, you didn\'t say the magic word');
                }
            }).catch(err => { throw err; });
        } else {
            log.warn(`An invalid authorization was attempted with email: ${email} and password: ${password}`);
            reject('Ah, ah, ah, you didn\'t say the magic word');
        }
    })
};

app.post('/admin/login', (req, res) => {
    isAuthorized(req.body.email, req.body.password).then(() => {
        res.send({ isAuthorized: true });
    }).catch(() => {
        res.status(403).send({ isAuthorized: false });
    });
});

app.get('/admin/requireManualApproval', (req, res) => {
    isAuthorized(req.header("Email"), req.header("Password")).then(() => {
        log.info('authorized');
        const participantActivityQuery = {
            state: ActivityState.ACTIVE,
            completion_type: CompletionType.MANUAL,
        };

        const participantActivityProjection = {
            _id: 1,
            participant_name: 1,
            participant_email: 1,
            message: 1,
            email: 1,
        };

        db.collection('participant_activity').find(participantActivityQuery, {projection: participantActivityProjection}).toArray().then(docs => {
            res.json(docs.map(doc => {
                return {
                    ...doc,
                    email_subject: doc.email.subject,
                    email: {},
                }
            }));
        }).catch(err => { throw err; });
    }).catch((err) => {
        res.status(403).send({message: err});
    });
});
