import config from '@config';
import fs from 'fs';
import path from 'path';
import log from '@logger';
import cron from '@cron';
import { run } from '@selenium';
import {
    getHotTopicList,
} from '../tasks/crawling/naverHotTopic';
import {
    searchByKeyword,
} from '../tasks/crawling/daumHotTopic';
import { buildRTHIPost } from '../tasks/post/daumHotTopic';
import { closePopup } from '../tasks/util/closePopup';
import { tistory_oauth2_login } from '../tasks/login/tistory';
import { postToTistoryByAccessToken } from '../tasks/post/post';

const job = new cron('0 0,30 6-23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info('[rthi]', `${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        const { rthi } = config.tistory;
        run(async (browser) => {
            log.info('[rthi]', `포스팅 시작`);
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
                    log.info('[rthi]', `검색어 "${KEYWORD}"로 포스팅을 시작합니다`);
                    successLogTree[topicList[i]] = 1;
                    break;
                }
            }
            if (!KEYWORD) {
                log.info('[rthi]', '검색어 없음');
                return;
            }

            log.info('[rthi]', `searchByKeyword start`);
            const result = await searchByKeyword(KEYWORD, browser);
            log.info('[rthi]', `buildPost`);
            const post = buildRTHIPost(KEYWORD, result.relatedKeywords, result.profile, result.news, result.summary);
            const postDirPath = path.resolve('logs/post');
            fs.existsSync(postDirPath) || fs.mkdirSync(postDirPath);
            // fs.writeFileSync(path.join(postDirPath, `${Date.now()}_${KEYWORD}.html`), post.contents, 'utf-8');
            await closePopup(browser);
            const auth = await tistory_oauth2_login({
                blog_name: rthi.blog_name,
                redirect_uri: rthi.redirect_uri,
                id: rthi.id,
                pw: rthi.pw,
                client_id: rthi.client_id,
                client_secret: rthi.client_secret,
            }, browser);
            await postToTistoryByAccessToken({
                access_token: auth.access_token,
                blogName: rthi.blog_name,
                title: post.title,
                content: post.contents,
                tags: post.tags.join(','),
            });
            fs.writeFileSync(successLogPath, JSON.stringify(successLogTree, null, '\t'), 'utf-8');
        });
    }, timeout);
});
job.start();
