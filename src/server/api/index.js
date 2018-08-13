import express from 'express';

import google from './google';
import tistory from './tistory';

const router = express.Router();

router.use('/google', google);
router.use('/tistory', tistory);

router.use('/', (req, res) => {
    return res.status(404).send('Not found');
});

export default router;
