import express from 'express';
import crawling from './crawling';
import test from './test';

const router = express.Router();

router.use('*', (req, res, next) => {
    // middleware
    next();
});

router.use('/crawling', crawling);
router.use('/test', test);

router.use('/', (req, res) => {
    return res.status(404).send('Not found');
});

export default router;
