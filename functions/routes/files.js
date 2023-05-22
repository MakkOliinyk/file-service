const { v4 } = require('uuid');

const routes = async (fastify) => {
    fastify.post('/documents', async (request, reply) => {
        const { bucket } = this;
        const data = await request.file();
        const { filename, file, ownerId } = data.fields;

        const uploadParams = {
            destination: filename,
            metadata: {
                id: v4(),
                ownerId: ownerId
            }
        };

        try {
            await bucket.upload(file, uploadParams);
            console.log(`Success: File uploaded successfully: ${filename}`);
            reply.send({ message: 'File uploaded successfully', fileId: uploadParams.metadata.id });
        } catch (error) {
            console.error('Error: Failed to upload file', error);
            reply.status(500).send({ error: 'Error: Failed to upload file' });
        }
    });

    fastify.delete('/documents/:fileId', async (request, reply) => {
        const { bucket } = this;
        const { fileId } = request.params;

        try {
            await bucket.file(fileId).delete();
            console.log(`Success: File with ID ${fileId} deleted successfully`);
            reply.send({ message: 'Success: File deleted successfully' });
        } catch (error) {
            console.error('Error: Failed to delete file', error);
            reply.status(500).send({ error: 'Error: Failed to delete file' });
        }
    });

    fastify.get('/documents/:fileId', async (request, reply) => {
        const { bucket } = this;
        const { fileId } = request.params;

        try {
            const [file] = await bucket.file(fileId).download();
            reply.header('Content-Disposition', `attachment; filename=${fileId}`);
            reply.type('application/octet-stream');
            reply.send(file);
        } catch (error) {
            console.error('Error: Failed to download file', error);
            reply.status(500).send({ error: 'Error: Failed to download file' });
        }
    });

    fastify.get('/documents', async (request, reply) => {
        const { bucket } = this;
        const { ownerId } = request.query;

        try {
            const [files] = await bucket.getFiles();
            const filteredFiles = files.filter(file => file.metadata.ownerId === ownerId);
            reply.send({ files: filteredFiles });
        } catch (error) {
            console.error('Error: Failed to retrieve files', error);
            reply.status(500).send({ error: 'Error: Failed to retrieve files' });
        }
    });
};

module.exports = routes;

