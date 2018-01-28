import cron from '@cron';
import { run } from '@selenium';
import { getHotTopicList } from '@tasks/crawling/daumHotTopic';

const job = new cron('0 0,10,20,30,40,50 * * * *', () => {
    run(async (browser) => {
        await getHotTopicList(browser);
    })
});

job.start();