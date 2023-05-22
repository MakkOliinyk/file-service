const fastify = require('fastify');
const functions = require('firebase-functions');
const files = require('./routes/files');
const { getStorageInstance } = require('./config/dbconnector');

const app = fastify({ logger: true });

app.decorate('db', getStorageInstance());
app.register(files);

const handler = async (req, res) => {
    try {
        await app.ready();
        app.server.emit('request', req, res);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};

exports.app = functions.https.onRequest(handler);

