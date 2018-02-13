import jsdom from 'jsdom';
import log from '@logger';
import { run } from '@selenium';
import { summarize } from '../translate/summary';

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
        const issue = anchor.innerHTML;
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

        profile.querySelector('a.thumb img').removeAttribute('onerror');
        const anchors = profile.querySelectorAll('a');
        anchors.forEach(a => {
            a.removeAttribute('onclick');
        });

        const thumbnailImage = profile.querySelector('a.thumb').innerHTML;
        const infoTitle = profile.querySelector('.info_tit').innerHTML;
        const $infoDetails = profile.querySelectorAll('dl.dl_comm');
        let infoDetails = '';
        for (let i = 0, length = $infoDetails.length; i < length; i++) {
            infoDetails += $infoDetails[i].innerHTML;
        }
        return {
            thumbnailImage,
            infoTitle,
            infoDetails,
        };
    };

    /**
     * 뉴스
     * @returns {Promise<Array>}
     */
    let summaryExist = false;
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
                const isSummaryExsisting = await browser.isExisting('.layer_summary');
                let summary = null;
                if (isSummaryExsisting) {
                    summaryExist = true;
                    const summaryResult = await browser.execute(() => {
                        const texts = document.querySelectorAll('.layer_summary p');
                        const sum = [];
                        for (let i = 0, count = texts.length; i < count; i ++) {
                            const textContent = texts[i].textContent;
                            if (textContent.trim() !== '') {
                                sum.push(texts[i].textContent);
                            }
                        }
                        return sum;
                    });
                    summary = summaryResult.value;
                }
                news.push({
                    link: url,
                    title,
                    description: desc,
                    summary,
                    thumbnail_image: new RegExp(/(http|https)/).test(thumb[0]) ?
                        thumb[0] : 'http://i1.daumcdn.net/img-media/mobile/meta/news.png',
                });
            } catch (e) {
                log.error('[daumHotTopic.getNews]', e);
            }
        }
        log.info('[daumHotTopic.getNews]', news.length > 0 ? news : 'News not exist');
        return news.length > 0 ? news : null;
    };

    const news = await getNews();

    /**
     * Summary
     * @type {string}
     */
    let summary;
    if (!summaryExist) {
        // let fullNews = '';
        // news.forEach(n => {
        //     console.log(n.description);
        //     if (n.description) {
        //         fullNews += n.description;
        //     }
        // });
        // const match1 = fullNews.match(/\[.*]/gi);
        // const match2 = fullNews.match(/\(.*\)/gi);
        // if (match1) {
        //     match1.forEach(match => {
        //         fullNews = fullNews.replace(match, '');
        //     });
        // }
        // if (match2) {
        //     match2.forEach(match => {
        //         fullNews = fullNews.replace(match, '');
        //     });
        // }
        // summary = await summarize(fullNews, browser);
        summary = ''
    } else {
        news.forEach(n => {
            if (n.summary) {
               summary = n.summary;
            }
        });
    }
    return {
        relatedKeywords: getRelatedKeywords(),
        profile: getProfile(),
        news,
        summary,
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