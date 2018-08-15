import log from '@logger';
import { load } from '../../util/store';

const { google } = require('googleapis');

const STORE_NAME = 'google_access_token';

export const google_oauth2_login = async ({ id, pw, client_id, client_secret, redirect_url }, browser) => {

    const cache = load(STORE_NAME);
    if (cache && cache.client_id === client_id) {
        const now = new Date().getTime();
        const remain = cache.expiry_date - now;
        if (remain > 600000) {
            log.info('[google.google_oauth2_login] get access_token in cache');
            return cache;
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

    return load(STORE_NAME);
};
