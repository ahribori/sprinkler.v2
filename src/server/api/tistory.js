import config from '@config';
import log from '@logger';
import express from 'express';
import axios from 'axios';
import authMiddleware from '../middlewares/auth';
import { run } from '../../selenium';
import { login } from '../../modules/login/tistory';
import { save } from '../../util/store';

const router = express.Router();

router.get('/oauth', async (req, res) => {
    const { code, state } = req.query;
    const blog_identifier = state;
    const { client_id, client_secret, redirect_uri } = config.tistory[blog_identifier];
    const auth = {};
    axios.get(`https://www.tistory.com/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}&grant_type=authorization_code`)
        .then(response => {
            const { access_token } = response.data;
            auth.access_token = access_token;
            auth.expiry_date = new Date().getTime() + 3600000;
            save(`tistory_${state}_access_token`, auth);
            log.info('[tistory.oauth2] Authenticated', JSON.stringify(auth, null, 2));
            res.send(`<div id="oauth2_success">${response.data.access_token}</div>`);
        })
        .catch(error => {
            res.send(`<div id="oauth2_failure">${error.message}</div>`);
        });

});

router.post('/login', authMiddleware);
router.post('/login', async (req, res) => {
    const { id, pw } = req.body;
    await run(async browser => {
        await login(id, pw, browser);
    });
    return res.json('login request success.');
});

export default router;