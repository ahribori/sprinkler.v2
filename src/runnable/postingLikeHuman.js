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
import { closePopup } from '../tasks/util/closePopup';
import { login } from '../tasks/login/tistory';
import { postToTistory } from '../tasks/post/post';

const ps = new PermanentSession();

const job = new cron('0 0 6-23 * * *', () => {
    const minutesTimeoutRange = 40;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info(`${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        //////////////////
        try {
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
                        log.info(`검색어 "${KEYWORD}"로 포스팅을 시작합니다`);
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
                const post = buildPost(KEYWORD, result.relatedKeywords, result.profile, result.news, result.summary);
                fs.writeFileSync(path.join(path.resolve('logs'), `${Date.now()}_${KEYWORD}.html`), post.contents, 'utf-8');
                await closePopup(browser);
                await login(process.env.tistoryId, process.env.tistoryPw, browser);
                await postToTistory(
                    'http://realtime-hot-issue-analyze.tistory.com',
                    post.title,
                    post.contents,
                    post.tags,
                    browser
                )
            });
        } catch (e) {
            log.error(e);
        }
        //////////////////
    }, timeout);
});
job.start();
