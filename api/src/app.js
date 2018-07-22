const express = require('express');
//const bodyParser = require("body-parser");
const app = express();
const MongoClient = require('mongodb').MongoClient;
const MongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/office_quest';

let setHeaders = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    next();
};
const logError = (err, req, res, next) => {
    console.error("err.stack", err.stack);
    next(err)
};
const clientErrorHandler = (err, req, res, next) => {
    if (req.xhr) {
        res.status(500).json({ error: err })
    } else {
        next(err)
    }
};
const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.render('error', { error: err })
};
//app.use(bodyParser.json());
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
    console.log("Database connection ready");

    // Initialize the app.
    const server = app.listen(process.env.PORT || 4201, () => {
        const port = server.address().port;
        console.log("App now running on port", port);
    });
});

app.get('/', function (req, res) {
    db.collection('quest').find({}).toArray().then((data) => {
        res.json(data);
    }).catch((err) => {
        throw err
    })
});
