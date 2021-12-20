import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import config from 'config';
import logger from './utils/logger';
import {version } from '../package.json';
import socket from './socket';

import cors from 'cors';

const port = config.get<number>('port');
const corsOrigin = config.get<string>('corsOrigin');

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        credentials:true,
    }
})
app.use(cors());

app.get('/', (req, res) => {
    res.send("Server is up ");
    console.log("Server running");
})

httpServer.listen(port , () => {
    logger.info("Server listening")
    logger.info(`Version ${version}`);

    socket({io});
})
