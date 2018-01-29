import cron from '@cron';
import { getHotTopicList } from '@tasks/crawling/daumHotTopic';
import PermanentSession from '@selenium/permanentSession';

const ps = new PermanentSession();

const job = new cron('0 0,10,20,30,40,50 * * * *', () => {
    ps.enqueueTransaction(async (browser) => {
        await getHotTopicList(browser);
    });
});

job.start();