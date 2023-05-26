const fileUploadMiddleware = require('busboy-firebase');

const { getStorageInstance, getFirestoreInstance } = require('../config/dbconnector');

const routes = (app) => {
    const storage = getStorageInstance();
    const db = getFirestoreInstance();

    app.post('/documents', fileUploadMiddleware, async (request, reply) => {
        const data = await request.files[0];
        const { fileName, ownerId } = request.body;
        const { buffer } = data;

        try {
            await storage.file(fileName).save(buffer);
            console.log(`Success: File uploaded successfully: ${fileName}`);

            const dataRef = await db.collection('filesData').add({
                fileName,
                ownerId,
            });

            reply.send({ message: 'ok', fileId: dataRef.id });
        } catch (error) {
            console.error('Error: Failed to upload file', error);
            reply.status(500).send(error);
        }
    });

    app.delete('/documents/:fileId', async (request, reply) => {
        const { fileId } = request.params;

        try {
            const fileDoc = await db.collection('filesData').doc(fileId).get();
            const fileData = fileDoc.data();

            if (!fileData) {
                reply.status(404).send({ error: 'File not found' });
                return;
            }

            const fileName = fileData.fileName;

            await storage.file(fileName).delete();
            await fileDoc.ref.delete();

            console.log(`Success: File with ID ${fileId} deleted successfully`);
            reply.send({ message: 'Success: File deleted successfully' });
        } catch (error) {
            console.error('Error: Failed to delete file', error);
            reply.status(500).send(error);
        }
    });

    app.get('/documents/:fileId/info', async (request, reply) => {
        const { fileId } = request.params;

        try {
            const fileDoc = await db.collection('filesData').doc(fileId).get();
            const fileData = fileDoc.data();

            if (!fileData) {
                reply.status(404).send({ error: 'File not found' });
                return;
            }

            const fileName = fileData.fileName;

            reply.send({ fileName });
        } catch (error) {
            reply.status(500).send(error);
        }
    });

    app.get('/documents/:fileId', async (request, reply) => {
        const { fileId } = request.params;

        try {
            const fileDoc = await db.collection('filesData').doc(fileId).get();
            const fileData = fileDoc.data();

            if (!fileData) {
                reply.status(404).send({ error: 'File not found' });
                return;
            }

            const file = await storage.file(fileData.fileName);
            const fileStream = file.createReadStream();

            reply.header('Content-Disposition', `attachment; filename=${fileData.fileName}`);
            reply.type('application/octet-stream');
            fileStream.pipe(reply);
        } catch (error) {
            console.error('Error: Failed to download file', error);
            reply.status(500).send(error);
        }
    });

    app.get('/documents', async (request, reply) => {
        const { ownerId } = request.query;

        try {
            const filesRef = await db.collection('filesData').where('ownerId', '==', ownerId).get();
            const files = filesRef.docs.map((doc) => {
                const data = doc.data();
                data.id = doc.id;
                return data;
            });
            reply.send({ files });
        } catch (error) {
            console.error('Error: Failed to retrieve files', error);
            reply.status(500).send(error);
        }
    });
};

module.exports = routes;

