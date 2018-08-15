import config from '@config';
import fs from 'fs';
import path from 'path';
import log from '@logger';
import { run } from '@selenium';
import {
    getHotTopicList,
} from '../modules/crawling/naverHotTopic';
import {
    searchByKeyword,
} from '../modules/crawling/daumHotTopic';
import { buildAlmondBongBongPost } from '../modules/post/daumHotTopic';
import { closePopup } from '../modules/util/closePopup';
import { tistory_oauth2_login } from '../modules/login/tistory';
import { postToTistoryByAccessToken } from '../modules/post/post';

const { mygumi } = config.tistory;

const r = () => {
    run(async (browser) => {
        log.info('[mygumi]', `포스팅 시작`);
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
                log.info('[mygumi]', `검색어 "${KEYWORD}"로 포스팅을 시작합니다`);
                successLogTree[topicList[i]] = Date.now();
                break;
            }
        }
        if (!KEYWORD) {
            log.info('[mygumi]', '검색어 없음');
            return;
        }

        log.info('[mygumi]', `searchByKeyword start`);
        const result = await searchByKeyword(KEYWORD, browser);
        log.info('[mygumi]', `buildPost`);
        const post = buildAlmondBongBongPost(KEYWORD, result.relatedKeywords, result.profile, result.news, result.summary);
        const postDirPath = path.resolve('logs/post');
        fs.existsSync(postDirPath) || fs.mkdirSync(postDirPath);
        // fs.writeFileSync(path.join(postDirPath, `${Date.now()}_${KEYWORD}.html`), post.contents, 'utf-8');
        await closePopup(browser);
        const auth = await tistory_oauth2_login({
            blog_identifier: 'mygumi',
            redirect_uri: mygumi.redirect_uri,
            id: mygumi.id,
            pw: mygumi.pw,
            client_id: mygumi.client_id,
            client_secret: mygumi.client_secret,
        }, browser);
        await postToTistoryByAccessToken({
            access_token: auth.access_token,
            blogName: 'mygumi2',
            title: post.title,
            content: post.contents,
            tags: post.tags.join(','),
        });
        fs.writeFileSync(successLogPath, JSON.stringify(successLogTree, null, '\t'), 'utf-8');
    });
};

// r();