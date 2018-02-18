import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json('crawling');
});

export default router;