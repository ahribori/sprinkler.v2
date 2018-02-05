require('dotenv').config();
import fs from 'fs';
import path from 'path';
import log from '@logger';
import cron from '@cron';
import PermanentSession from '@selenium/permanentSession';
import {
    getHotTopicList,
    searchByKeyword,
} from '../tasks/crawling/daumHotTopic';
import { buildPost } from "../tasks/post/daumHotTopic";
import { login } from "../tasks/login/tistory";
const ps = new PermanentSession();

const job = new cron('0 0,10,20,30,40,50 * * * *', () => {
    ps.enqueueTransaction(async (browser) => {
        const topicList = await getHotTopicList(browser);
        const keywordsLogPath = path.resolve('logs/keywords.log');
        fs.existsSync(keywordsLogPath) || fs.writeFileSync(keywordsLogPath, JSON.stringify({}), 'utf-8');
        const file = fs.readFileSync(keywordsLogPath);
        const keywordTree = JSON.parse(file);

        const willPost = [];
        topicList.forEach(keyword => {
            if (keywordTree[keyword] === undefined) {
                keywordTree[keyword] = 1;
                willPost.push(keyword);
                console.log(keyword);
            } else {
                keywordTree[keyword] += 1;
            }

        });
        fs.writeFileSync(keywordsLogPath, JSON.stringify(keywordTree, null, '\t'), 'utf-8');

        if (willPost.length > 0) {
            // tistory login
            await login(process.env.tistoryId, process.env.tistoryPw, browser);
            log.info('[runnable.pollingHotTopic.js]', willPost);
            for (let i = 0, count = willPost.length; i < count; i++) {
                const result = await searchByKeyword(willPost[i], browser);
                await buildPost(willPost[i], result.relatedKeywords, result.profile, result.news);
                await browser.pause(10000);
            }
        }
    });
});

job.start();