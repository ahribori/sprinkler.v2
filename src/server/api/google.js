import config from '@config';
import log from '@logger';
import express from 'express';
import { save } from '../../util/store';

const router = express.Router();
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    config.google.client_id,
    config.google.client_secret,
    config.google.redirect_url,
);
const STORE_NAME = 'google_access_token';

router.get('/oauth', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    const auth = {
        client_id: config.google.client_id,
        ...tokens,
    };

    save(STORE_NAME, auth);
    log.info('[google.oauth2] Authenticated', JSON.stringify(auth, null, 2));
    res.send(`<div id="oauth2_success">${JSON.stringify(auth, null, 2)}</div>`);
});

export default router;