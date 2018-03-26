import config from '@config';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import log from '@logger';
import api from './api';

const app = express();
const port = config.server.port || 8989;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', api);

app.use((err, req, res, next) => {
    // Error handler
    log.error(err.stack);
    res.status(500).send('Something broke');
});

app.listen(port, () => {
    log.info(`Server listening on port ${port}`);
});