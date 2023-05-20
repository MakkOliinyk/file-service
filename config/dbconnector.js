import fp from 'fastify-plugin';
import AWS from 'aws-sdk';

async function dbConnector(fastify, options) {
    AWS.config.update({
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
    });

    const s3 = new AWS.S3();

    fastify.decorate('s3', s3);
}

export default fp(dbConnector);
