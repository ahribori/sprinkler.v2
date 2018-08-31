import cron from '@cron';
import { run } from '../selenium';
import { heaven } from '../modules/post/heaven';

const job = new cron('0 0,30 0,1,2,19-23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    setTimeout(() => {
        run(async browser => {
            await heaven(browser);
        }, { headless: false });
    }, timeout);
});

job.start();
