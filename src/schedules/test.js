import cron from '@cron'

const job = new cron('0 * * * * *', () => {
    // run every minutes
    console.log('run every minutes')
});

job.start();