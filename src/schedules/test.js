import cron from 'cron';

const CronJob = cron.CronJob;

const job = new CronJob('0 * * * * *', () => {
    console.log('run every minutes');
});

job.start();