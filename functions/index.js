const express = require('express');
const functions = require('firebase-functions');

const filesRoutes = require('./routes/files');

const app = express();

filesRoutes(app);

exports.app = functions.https.onRequest(app);


