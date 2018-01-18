import jsdom from 'jsdom';

const { JSDOM } = jsdom;
import { run } from '../selenium';

/**
 * 다음 실시간 검색어 가져오기
 * @param browser
 * @returns {Promise<Array>}
 */
const getHotTopicList = async (browser) => {
    await browser.url('https://www.daum.net');
    const html = await browser.getHTML('.hotissue_builtin');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const lis = document.querySelectorAll('li');
    const hotTopicList = [];
    for (let i = 0, length = lis.length; i < length; i++) {
        const anchor = lis[i].querySelector('a');
        const rank = i + 1;
        const issue = anchor.innerHTML;
        const link = anchor.getAttribute('href');
        hotTopicList.push({
            rank,
            issue,
            link,
        });
    }
    return hotTopicList;
};

/**
 * 실시간 검색어로 검색하기
 * @param hotTopicList
 * @param browser
 * @returns {Promise<null>}
 */
const searchByHotTopicList = async (hotTopicList, browser) => {
    if (hotTopicList.length === 0) return null;
    await browser.url(hotTopicList[0].link);
    const html = await browser.getHTML('#cMain');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    console.log(document.querySelector('#profColl'));
};

export default {
    run: () => {
        /**
         * 작업들을 순차적으로 실행
         */
        run(async (browser) => {
            const hotTopicList = await getHotTopicList(browser);
            const searchResult = await searchByHotTopicList(hotTopicList, browser);
        });
    }
}