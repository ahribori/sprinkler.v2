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
        hotTopicList.push(issue);
    }
    log.info('[daumHotTopic.getHotTopicList]', '실시간 검색어\n', hotTopicList);
    return hotTopicList;
};

/**
 * 실시간 검색어로 검색하기
 * @param keyword
 * @param browser
 * @returns {Promise<null>}
 */
export const searchByKeyword = async (keyword, browser) => {
    if (!keyword || keyword === undefined || keyword === null || keyword === '') {
        log.warn('[daumHotTopic.searchByKeyword]', '(!keyword || keyword === undefined || keyword === null || keyword === \'\')');
        return null;
    }
    await browser.url(`http://search.daum.net/search?w=tot&q=${keyword}`);
    const html = await browser.getHTML('#cMain');
    const dom = new JSDOM(html);
    const document = dom.window.document;

    /**
     * 관련 검색어
     * @returns {Array}
     */
    const getRelatedKeywords = () => {
        const relatedKeywords = [];
        const list = document.querySelectorAll('#netizenColl_right.content_keyword .list_keyword a span');
        for (let i = 0, count = list.length; i < count; i++) {
            relatedKeywords.push(list[i].innerHTML);
        }
        log.info('[daumHotTopic.getRelatedKeywords]', '관련 검색어\n', relatedKeywords);
        return relatedKeywords;
    };

    /**
     * 인물 프로필
     * @returns {*} HTML
     */
    const getProfile = () => {
        const profile = document.querySelector('#profColl .rwd_info');
        log.info('[daumHotTopic.getProfile]', profile ? 'Profile exist' : 'Profile not exist');
        if (!profile) {
            return null;
        }
        return profile.innerHTML;
    };

    /**
     * 뉴스
     * @returns {Promise<Array>}
     */
    const getNews = async () => {
        const newsList = document.querySelectorAll('#newsColl .coll_cont li');
        const news = [];
        for (let i = 0, count = newsList.length; i < count; i++) {
            try {
                const thumbnailWrapper = newsList[i].querySelector('.wrap_thumb a');
                if (!thumbnailWrapper) {
                    continue;
                }
                const href = thumbnailWrapper.getAttribute('href');
                const url = new RegExp(/v.media.daum.net/).test(href) ?
                    href.split('?')[0] : href;
                await browser.url(url);
                const title = await browser.getAttribute('meta[property="og:title"]', 'content');
                const desc = await browser.getAttribute('meta[property="og:description"]', 'content');
                const thumb = await browser.getAttribute('meta[property="og:image"]', 'content');
                news.push({
                    link: url,
                    title,
                    description: desc,
                    thumbnail_image: thumb[0],
                });
            } catch (e) {
                log.error('[daumHotTopic.getNews]', e);
            }
        }
        log.info('[daumHotTopic.getNews]', news.length > 0 ? news : 'News not exist');
        return news.length > 0 ? news : null;
    };

    const news = await getNews();
    return {
        relatedKeywords: getRelatedKeywords(),
        profile: getProfile(),
        news,
    }
};

export default {
    run: () => {
        /**
         * 작업들을 순차적으로 실행
         */
        run(async (browser) => {
            const hotTopicList = await getHotTopicList(browser);
            const searchResult = await searchByKeyword(hotTopicList[0], browser);
            console.log(searchResult)
        });
    }
}