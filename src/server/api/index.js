import express from 'express';
import authMiddleware from '../middlewares/auth';

import crawling from './crawling';
import test from './test';

const router = express.Router();

router.use('*', authMiddleware);

router.use('/crawling', crawling);
router.use('/test', test);

router.use('/', (req, res) => {
    return res.status(404).send('Not found');
});

export default router;
