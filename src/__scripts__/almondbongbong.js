import config from '@config';
import fs from 'fs';
import path from 'path';
import log from '@logger';
import cron from '@cron';
import { run } from '@selenium';
import {
    getHotTopicList,
} from '../modules/crawling/naverHotTopic';
import {
    searchByKeyword,
} from '../modules/crawling/daumHotTopic';
import { buildAlmondBongBongPost } from '../modules/post/daumHotTopic';
import { closePopup } from '../modules/util/closePopup';
import { login } from '../modules/login/tistory';
import { postToTistory } from '../modules/post/post';
import TelegramBot from '../util/telegram';

const bot = new TelegramBot();

const job = new cron('0 0,30 6-23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info('[almondbongbong]', `${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);
    setTimeout(() => {
        const { almondbongbong } = config.tistory;
        run(async (browser) => {
            log.info('[almondbongbong]', `포스팅 시작`);
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
                    log.info('[almondbongbong]', `검색어 "${KEYWORD}"로 포스팅을 시작합니다`);
                    successLogTree[topicList[i]] = Date.now();
                    break;
                }
            }
            if (!KEYWORD) {
                log.info('[almondbongbong]', '검색어 없음');
                return;
            }
            fs.writeFileSync(successLogPath, JSON.stringify(successLogTree, null, '\t'), 'utf-8');

            log.info('[almondbongbong]', `searchByKeyword start`);
            const result = await searchByKeyword(KEYWORD, browser);
            log.info('[almondbongbong]', `buildPost`);
            const post = buildAlmondBongBongPost(KEYWORD, result.relatedKeywords, result.profile, result.news, result.summary);
            const postDirPath = path.resolve('logs/post');
            fs.existsSync(postDirPath) || fs.mkdirSync(postDirPath);
            // fs.writeFileSync(path.join(postDirPath, `${Date.now()}_${KEYWORD}.html`), post.contents, 'utf-8');
            await closePopup(browser);
            log.info('[almondbongbong]', `login`);
            await login(almondbongbong.id, almondbongbong.pw, browser);
            log.info('[almondbongbong]', `postToTistory`);
            await postToTistory(
                almondbongbong.domain,
                post.title,
                post.contents,
                post.tags,
                browser
            );
            // bot.sendMessage(`검색어 "${KEYWORD}"로 포스팅을 마쳤습니다.`);
        }, {
            protocol: almondbongbong.seleniumProtocol,
            host: almondbongbong.seleniumHost,
            port: almondbongbong.seleniumPort,
        });
    }, timeout);
});
job.start();
