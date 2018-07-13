import express from 'express';
import authMiddleware from '../middlewares/auth';

import google from './google';
import tistory from './tistory';
import test from './test';

const router = express.Router();


router.use('/google', google);
router.use('/tistory', tistory);
router.use('/test', authMiddleware);
router.use('/test', test);

router.use('/', (req, res) => {
    return res.status(404).send('Not found');
});

export default router;
