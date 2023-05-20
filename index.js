import fastify from 'fastify';

import env from 'dotenv';

import files from './routes/files';
import dbconnector from './config/dbconnector';

env.config();

const app = fastify({ logger: true });

app.register(files);
app.register(dbconnector, {});

const start = async () => {
    try {
        await app.listen(process.env.PORT || 5000, '0.0.0.0');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
