import jsdom from 'jsdom';
import log from '@logger';
import { run } from '@selenium';

const { JSDOM } = jsdom;

/**
 * 다음 실시간 검색어 가져오기
 * @param browser
 * @returns {Promise<Array>}
 */
export const getHotTopicList = async (browser) => {
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
    log.debug('실시간 검색어\n', hotTopicList);
    return hotTopicList;
};

/**
 * 실시간 검색어로 검색하기
 * @param hotTopicList
 * @param browser
 * @returns {Promise<null>}
 */
export const searchByHotTopicList = async (hotTopicList, browser) => {
    if (hotTopicList.length === 0) return null;
    await browser.url(hotTopicList[0].link);
    const html = await browser.getHTML('#cMain');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    /**
     * 관련 검색어
     */
    const getRelatedKeywords = () => {
        const relatedKeywords = [];
        const list = document.querySelectorAll('#netizenColl_right.content_keyword .list_keyword a span');
        for (let i = 0, count = list.length; i < count; i++) {
            relatedKeywords.push(list[i].innerHTML);
        }
        log.debug('관련 검색어\n', relatedKeywords);
    };
    getRelatedKeywords();
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