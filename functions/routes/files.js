const { v4 } = require('uuid');

const routes = async (fastify) => {
    fastify.post('/documents', async (request, reply) => {
        const { storage, db } = this;
        const data = await request.file();
        const { filename, file, ownerId } = data.fields;

        const uploadParams = {
            destination: filename
        };

        try {
            await storage.upload(file, uploadParams);
            console.log(`Success: File uploaded successfully: ${filename}`);

            const fileId = v4();

            // Store file metadata in Firestore
            await db.collection('files').doc(fileId).set({
                filename,
                ownerId,
            });

            reply.send({ message: 'File uploaded successfully' });
        } catch (error) {
            console.error('Error: Failed to upload file', error);
            reply.status(500).send({ error: 'Error: Failed to upload file' });
        }
    });

    fastify.delete('/documents/:fileId', async (request, reply) => {
        const { storage, db } = this;
        const { fileId } = request.params;

        try {
            const fileDoc = await db.collection('files').doc(fileId).get();
            const fileData = fileDoc.data();

            if (!fileData) {
                reply.status(404).send({ error: 'File not found' });
                return;
            }

            const fileName = fileData.filename;

            await storage.file(fileName).delete();

            await fileDoc.ref.delete();

            console.log(`Success: File with ID ${fileId} deleted successfully`);
            reply.send({ message: 'Success: File deleted successfully' });
        } catch (error) {
            console.error('Error: Failed to delete file', error);
            reply.status(500).send({ error: 'Error: Failed to delete file' });
        }
    });

    fastify.get('/documents/:fileId', async (request, reply) => {
        const { storage, db } = this;
        const { fileId } = request.params;

        try {
            const fileDoc = await db.collection('files').doc(fileId).get();
            const fileData = fileDoc.data();

            if (!fileData) {
                reply.status(404).send({ error: 'File not found' });
                return;
            }

            const [file] = await storage.file(fileData.filename).download();
            reply.header('Content-Disposition', `attachment; filename=${fileData.filename}`);
            reply.type('application/octet-stream');
            reply.send(file);
        } catch (error) {
            console.error('Error: Failed to download file', error);
            reply.status(500).send({ error: 'Error: Failed to download file' });
        }
    });

    fastify.get('/documents', async (request, reply) => {
        const { db } = this;
        const { ownerId } = request.query;

        try {
            const filesRef = await db.collection('files').where('ownerId', '==', ownerId).get();
            const files = filesRef.docs.map((doc) => doc.data());
            reply.send({ files });
        } catch (error) {
            console.error('Error: Failed to retrieve files', error);
            reply.status(500).send({ error: 'Error: Failed to retrieve files' });
        }
    });
};

module.exports = routes;

