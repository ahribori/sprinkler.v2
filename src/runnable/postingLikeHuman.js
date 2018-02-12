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
import { buildPost } from '../tasks/post/daumHotTopic';
import { login } from '../tasks/login/tistory';
import { closePopup } from '../tasks/util/closePopup';

const ps = new PermanentSession();

const job = new cron('0 0 7,8,9,12,13,14,19,20,21,22,23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1)); // 0 ~29
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1)); // 0 ~ 59
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info(`${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        //////////////////
        ps.enqueueTransaction(async (browser) => {
            const topicList = await getHotTopicList(browser);
            const successLogPath = path.resolve('logs/success.log');
            fs.existsSync(successLogPath) || fs.writeFileSync(successLogPath, JSON.stringify({}), 'utf-8');
            const file = fs.readFileSync(successLogPath);
            const successLogTree = JSON.parse(file);

            let KEYWORD;
            for (let i = 0, length = topicList.length; i < length; i++) {
                if (successLogTree[topicList[i]] === undefined) {
                    // TODO 포스팅
                    KEYWORD = topicList[i];
                    successLogTree[topicList[i]] = 1;
                    break;
                }
            }
            if (!KEYWORD) {
                log.info('검색어 없음');
                return;
            }
            fs.writeFileSync(successLogPath, JSON.stringify(successLogTree, null, '\t'), 'utf-8');

            const result = await searchByKeyword(KEYWORD, browser);
            await closePopup(browser);
            const html = buildPost(KEYWORD, result.relatedKeywords, result.profile, result.news);
            fs.writeFileSync(path.join(path.resolve('logs'), `${Date.now()}_${KEYWORD}.html`), html, 'utf-8');
        });
        //////////////////
    }, timeout);
});
job.start();
