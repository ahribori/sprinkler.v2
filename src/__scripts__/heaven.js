import config from '@config';
import cron from '@cron';
import { run } from '../selenium';

const { id, pw } = config.heaven;

const job = new cron('0 0,30 0,1,2,19-23 * * *', () => {
    const minutesTimeoutRange = 20;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    setTimeout(() => {
        run(async browser => {
            const WAIT_FOR_EXIST_TIME = 60000;
            const ASIDE_MENU = '#asideMenu';
            const ID_INPUT = '#asideMenu > div.sidebar-wrap > div.sidebar-box > form > div:nth-child(2) > div > input';
            const PW_INPUT = '#asideMenu > div.sidebar-wrap > div.sidebar-box > form > div:nth-child(3) > div > input';
            const LOGIN_BUTTON = '#asideMenu > div.sidebar-wrap > div.sidebar-box > form > div:nth-child(4) > button';
            const CRAWLING_TITLE_EXCLUDE_PATTERN = '(뽐|뽐뿌)';
            const CRAWLING_CONTENTS_EXCLUDE_PATTERN = '(뽐|뽐뿌)';
            const MAX_CONTENTS_LENGTH = 80;

            // 크롤링
            await browser.url('http://www.ppomppu.co.kr/zboard/zboard.php?id=freeboard');
            const rowsElements = await browser.elements('#revolution_main_table tr td:nth-child(3) a');
            const rows = rowsElements.value;
            const articleList = [];

            const postingPayload = {
                title: null,
                contents: null,
            };

            for (let x = 1, total = rows.length; x < total; x++) {
                const title = await browser.elementIdText(rows[x].ELEMENT);
                const href = await browser.elementIdAttribute(rows[x].ELEMENT, 'href');
                const link = href.value;
                articleList.push({
                    title: title.value,
                    link,
                })
            }

            for (let i = 0, total = articleList.length; i < total; i++) {
                const article = articleList[i];

                // 제목 필터
                if (new RegExp(CRAWLING_TITLE_EXCLUDE_PATTERN, 'gi').test(article.title)) {
                    continue;
                }

                await browser.url(article.link);

                const contents = await browser.getText('td.board-contents');

                // 컨텐츠 길이 필터
                if (contents && contents.length > MAX_CONTENTS_LENGTH) {
                    continue;
                }
                // 컨텐츠 필터
                if (new RegExp(CRAWLING_CONTENTS_EXCLUDE_PATTERN, 'gi').test(contents)) {
                    continue;
                }

                console.log(`제목: ${article.title}`);
                console.log(`내용: ${contents}`);
                console.log(`길이: ${contents.length}`);
                postingPayload.title = article.title;
                postingPayload.contents = contents;
                break;
            }

            // 로그인
            console.log(`헬븐넷 로그인 ${id}//${pw}`);
            await browser.url('https://hellven.net');
            await browser.waitForExist(ASIDE_MENU, WAIT_FOR_EXIST_TIME);

            await browser.execute((selector) => {
                document.querySelector(selector).style.display = 'block';
            }, ASIDE_MENU);

            await browser.waitForExist(ID_INPUT, WAIT_FOR_EXIST_TIME);

            await browser.execute((selector, id) => {
                document.querySelector(selector).value = id;
            }, ID_INPUT, id);

            await browser.execute((selector, pw) => {
                document.querySelector(selector).value = pw;
            }, PW_INPUT, pw);

            await browser.click(LOGIN_BUTTON);
            await browser.pause(3000);

            // 글쓰기
            await browser.url('https://hellven.net/bbs/write.php?bo_table=fr5');
            await browser.waitForExist('#wr_subject', WAIT_FOR_EXIST_TIME);
            await browser.execute((title) => {
                document.querySelector('#wr_subject').value = title;
            }, postingPayload.title);
            await browser.waitForExist('#fwrite > div:nth-child(17) > div > iframe', WAIT_FOR_EXIST_TIME);
            const iframeElement = await browser.element('#fwrite > div:nth-child(17) > div > iframe');
            await browser.frame(iframeElement.value);
            await browser.waitForExist('#se2_iframe', WAIT_FOR_EXIST_TIME);
            await browser.waitForExist('.se2_to_text', WAIT_FOR_EXIST_TIME);
            await browser.pause(5000);
            await browser.click('.se2_to_text');
            await browser.alertAccept();
            await browser.pause(5000);
            await browser.element('textarea.se2_input_syntax.se2_input_text');
            await browser.waitForExist('textarea.se2_input_syntax.se2_input_text', WAIT_FOR_EXIST_TIME);
            await browser.execute((contents) => {
                document.querySelector('textarea.se2_input_syntax.se2_input_text').value = contents;
            }, postingPayload.contents);
            await browser.frameParent();
            await browser.pause(1000);
            await browser.click('#btn_submit');
            await browser.pause(1000);
        });
    }, timeout);
});

job.start();
