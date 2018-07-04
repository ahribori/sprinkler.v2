import config from '@config';
import log from '@logger';
import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    config.google.client_id,
    config.google.client_secret,
    config.google.redirect_url,
);
const GOOGLE_ACCESS_TOKEN_PATH = path.resolve('./logs/google_access_token.json');

router.get('/', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    const auth = {
        client_id: config.google.client_id,
        ...tokens,
    };

    fs.writeFileSync(GOOGLE_ACCESS_TOKEN_PATH, JSON.stringify(auth, null, 2), 'utf-8');
    log.info('[Google.oauth2] Authenticated', JSON.stringify(auth, null, 2));
    res.send(`<div id="oauth2_success">${JSON.stringify(auth, null, 2)}</div>`);
});

export default router;