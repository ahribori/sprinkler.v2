import config from '@config';
import { run } from '@selenium';
import { google_oauth2_login } from '../modules/login/google';

const GOOGLE_ID = config.google.id;
const GOOGLE_PW = config.google.pw;
const GOOGLE_CLIENT_ID = config.google.client_id;
const GOOGLE_CLIENT_SECRET = config.google.client_secret;
const GOOGLE_REDIRECT_URL = config.google.redirect_url;

const r = () => {
    run(async browser => {

        const tokens = await google_oauth2_login({
            id: GOOGLE_ID,
            pw: GOOGLE_PW,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_url: GOOGLE_REDIRECT_URL,
        }, browser);

        console.log(typeof tokens);
        console.log(tokens);
    });
};

// r();
