const admin = require('firebase-admin');
const serviceAccount = require('./serviceKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://file-service-87ddd.appspot.com/'
});

const bucket = admin.storage().bucket();

module.exports = {
    getStorageInstance: () => bucket
};
