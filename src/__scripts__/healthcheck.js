import fs from 'fs';
import path from 'path';
import cron from '@cron';

const HEALTH_CHECK_FILE_PATH = path.resolve('./logs/health_check.json');
const job = new cron('0 0,10,20,30,40,50 * * * *', () => {
    const health = {
        last_checked: new Date().toLocaleString(),
    };
    fs.writeFileSync(HEALTH_CHECK_FILE_PATH, JSON.stringify(health, null, 2), 'utf-8');
});

job.start();
