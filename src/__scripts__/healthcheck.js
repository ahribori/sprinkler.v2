import cron from '@cron';
import { save } from '../util/store';

const job = new cron('0 0,10,20,30,40,50 * * * *', () => {
    const health = {
        last_checked: new Date().toLocaleString(),
    };
    save('health_check', health);
});

job.start();
