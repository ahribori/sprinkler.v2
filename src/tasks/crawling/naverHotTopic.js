import jsdom from 'jsdom';
import log from '@logger';
import { run } from '@selenium';

const { JSDOM } = jsdom;

/**
 * 네이버 실시간 검색어 가져오기
 * @param browser
 * @returns {Promise<Array>}
 */
export const getHotTopicList = async (browser) => {
    await browser.url('https://www.naver.com');
    const html = await browser.getHTML('.ah_list.PM_CL_realtimeKeyword_list_base');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const lis = document.querySelectorAll('li');
    const hotTopicList = [];
    for (let i = 0, length = lis.length; i < length; i++) {
        const anchor = lis[i].querySelector('.ah_k');
        const issue = anchor.innerHTML;
        hotTopicList.push(issue);
    }
    log.info('[naverHotTopic.getHotTopicList]', '네이버 실시간 검색어\n', hotTopicList);
    return hotTopicList;
};