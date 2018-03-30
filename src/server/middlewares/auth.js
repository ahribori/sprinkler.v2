import config from '@config';

const { secret } = config.server;

export default (req, res, next) => {
    const xSecret = req.get('x-secret');
    if (xSecret !== secret) {
        return res.sendStatus(403);
    }
    next();
};