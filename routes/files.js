const routes = async (fastify) => {
    fastify.post('/add', async (request, reply) => {
        const data = await request.file();
        const { filename, file, userId } = data.fields;

        const uploadParams = {
            Bucket: 'CHANGE_ME',
            Key: filename,
            Body: file,
            Metadata: {
                'ownerId': userId,
            },
        };

        try {
            const uploadResult = await fastify.s3.upload(uploadParams).promise();
            console.log(`Success: File uploaded successfully to ${uploadResult.Location}`);
            reply.send({ message: 'File uploaded successfully' });
        } catch (error) {
            console.error('Error: Failed to upload file', error);
            reply.status(500).send({ error: 'Error: Failed to upload file' });
        }
    });

    fastify.get('/getAll/:userId', async (request, reply) => {
        const { userId } = request.params;

        const listParams = {
            Bucket: 'CHANGE_ME',
            Prefix: '',
        };

        try {
            const listResult = await fastify.s3.listObjectsV2(listParams).promise();
            const files = listResult.Contents.filter((file) => file.Metadata.userId === userId);
            reply.send({ files });
        } catch (error) {
            console.error('Error: Failed to retrieve files', error);
            reply.status(500).send({ error: 'Error: Failed to retrieve files' });
        }
    });

    fastify.delete('/delete/:fileId', async (request, reply) => {
        const { fileId } = request.params;

        const deleteParams = {
            Bucket: 'CHANGE_ME',
            Key: fileId,
        };

        try {
            await fastify.s3.deleteObject(deleteParams).promise();
            console.log(`Success: File with ID ${fileId} deleted successfully`);
            reply.send({ message: 'Success: File deleted successfully' });
        } catch (error) {
            console.error('Error: Failed to delete file', error);
            reply.status(500).send({ error: 'Error: Failed to delete file' });
        }
    });

    fastify.get('/get/:fileId', async (request, reply) => {
        const { fileId } = request.params;

        const downloadParams = {
            Bucket: 'CHANGE_ME',
            Key: fileId,
        };

        try {
            const downloadResult = await fastify.s3.getObject(downloadParams).promise();
            const { Body } = downloadResult;

            const fileStream = fastify.s3.getObject(downloadParams).createReadStream();

            reply.header('Content-Disposition', `attachment; filename=${fileId}`);
            reply.type('application/octet-stream');
            fileStream.pipe(reply.res);
        } catch (error) {
            console.error('Error: Failed to download file', error);
            reply.status(500).send({ error: 'Error: Failed to download file' });
        }
    });
};

export default routes;

