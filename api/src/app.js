const express = require('express');
const app = express();

let setHeaders = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Content-Type', 'application/json');
    next();
};

const logError = (err, req, res, next) => {
    console.error(err.stack);
    next(err)
};

const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.render('error', { error: err })
};

const clientErrorHandler = (err, req, res, next) => {
    if (req.xhr) {
        res.status(500).send({ error: err })
    } else {
        next(err)
    }
};

app.use(setHeaders);
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

app.get('/', function (req, res) {
    res.json({"data": "it worked"})
});

app.listen(4201);