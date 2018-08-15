import config from '@config';
import { run } from '@selenium';
import { tistory_oauth2_login } from '../modules/login/tistory';

const blog_identifier = 'rthi';

const rthi = config.tistory[blog_identifier];
const TISTORY_ID = rthi.id;
const TISTORY_PW = rthi.pw;
const TISTORY_CLIENT_ID = rthi.client_id;
const TISTORY_CLIENT_SECRET = rthi.client_secret;
const TISTORY_REDIRECT_URI = rthi.redirect_uri;

const r = () => {
    run(async browser => {
        const access_token = await tistory_oauth2_login({
            blog_identifier,
            id: TISTORY_ID,
            pw: TISTORY_PW,
            client_id: TISTORY_CLIENT_ID,
            client_secret: TISTORY_CLIENT_SECRET,
            redirect_uri: TISTORY_REDIRECT_URI,
        }, browser);
        console.log(access_token);

    });
};

// r();