const fastify = require('fastify');
const functions = require('firebase-functions');
const files = require('./routes/files');
const { getStorageInstance, getFirestoreInstance } = require('./config/dbconnector');

let requestHandler = null;

const app = fastify({
    logger: true,
    serverFactory: (handler) => {
        requestHandler = handler;
        return require('http').createServer();
    },
});

app.addContentTypeParser('application/json', {}, (req, body, done) => {
    done(null, body.body);
});

app.decorate('storage', getStorageInstance());
app.decorate('db', getFirestoreInstance());
app.register(files);

exports.app = functions.https.onRequest((req, res) => {
    app.ready((err) => {
        if (err) throw err;
        requestHandler(req, res);
    });
});


