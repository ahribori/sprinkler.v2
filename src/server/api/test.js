import express from 'express';
import { run } from '../../selenium';
import { login } from '../../modules/login/tistory';
import { screenshot } from '../../modules/screenshot/screenshot';

const router = express.Router();

router.get('/', (req, res) => {
    res.json('test');
});

router.post('/tistoryLogin', (req, res) => {
    const {
        id,
        pw,
        protocol,
        host,
        port,
    } = req.body;
    run(async browser => {
        await login(id, pw, browser);
        await screenshot(browser);
    }, {
        protocol,
        host,
        port,
    });
    return res.sendStatus(200);
});

export default router;