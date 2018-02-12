require('dotenv').config();
import log from '@logger';
import cron from '@cron';

const job = new cron('0 0 7,8,9,12,13,14,19,21,22,23 * * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1)); // 0 ~29
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1)); // 0 ~ 59
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info(`${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        log.info(`실행.`);
    }, timeout);
});
job.start();
