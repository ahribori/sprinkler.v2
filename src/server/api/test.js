import express from 'express';
import { run } from '../../selenium';

const router = express.Router();

let pending;

router.get('/', async (req, res) => {
    if (!pending) {
        pending = true;
        await run(async browser => {
            await browser.url('https://google.co.kr');
        }, {
            callback: () => {
                pending = false;
            },
        });
        return res.json('Push task!');
    }
    return res.status(409).json('Pending... retry later...');
});

export default router;
