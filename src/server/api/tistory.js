import config from '@config';
import log from '@logger';
import express from 'express';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = express.Router();


router.get('/oauth', async (req, res) => {
    const { code, state } = req.query;
    const { client_id, client_secret, redirect_uri } = config.tistory.rthi;
    const TISTORY_ACCESS_TOKEN_PATH = path.resolve(`./logs/tistory_${state}_access_token.json`);
    const auth = {};
    axios.get(`https://www.tistory.com/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}&grant_type=authorization_code`)
        .then(response => {
            const { access_token } = response.data;
            auth.access_token = access_token;
            auth.expiry_date = new Date().getTime() + 3600000;
            fs.writeFileSync(TISTORY_ACCESS_TOKEN_PATH, JSON.stringify(auth, null, 2), 'utf-8');
            log.info('[tistory.oauth2] Authenticated', JSON.stringify(auth, null, 2));
            res.send(`<div id="oauth2_success">${response.data.access_token}</div>`);
        })
        .catch(error => {
            res.send(`<div id="oauth2_failure">${error.message}</div>`);
        });

});

export default router;