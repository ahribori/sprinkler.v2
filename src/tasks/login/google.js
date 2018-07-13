import fs from 'fs';
import path from 'path';

const { google } = require('googleapis');
const GOOGLE_ACCESS_TOKEN_PATH = path.resolve('./logs/google_access_token.json');

export const google_oauth2_login = async ({ id, pw, client_id, client_secret, redirect_url }, browser) => {

    if (fs.existsSync(GOOGLE_ACCESS_TOKEN_PATH)) {
        const auth = JSON.parse(fs.readFileSync(GOOGLE_ACCESS_TOKEN_PATH, 'utf-8'));
        if (auth.client_id = client_id) {
            const now = new Date().getTime();
            const remain = auth.expiry_date - now;
            if (remain > 600000) {
                log.info('[google.google_oauth2_login] get access_token in cache');
                return auth;
            }
        }
    }

    const oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_url,
    );

    // generate a url that asks permissions for Google+ and Google Calendar scopes
    const scopes = [
        'https://www.googleapis.com/auth/blogger',
    ];

    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        // access_type: 'offline',

        // If you only need one scope you can pass it as a string
        scope: scopes,
    });

    await browser.url(url)
        .waitForExist('#identifierId', 10000)
        .pause(1000)
        .setValue('#identifierId', id)
        .click('#identifierNext')
        .waitForExist('#password input[type=password]', 10000)
        .pause(1000)
        .setValue('#password input[type=password]', pw)
        .pause(1000)
        .click('#passwordNext')
        .waitForExist('#oauth2_success', 30000);

    return JSON.parse(fs.readFileSync(GOOGLE_ACCESS_TOKEN_PATH, 'utf-8'));
};
