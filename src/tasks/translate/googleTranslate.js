import jsdom from 'jsdom';
import log from '@logger';
import { run } from '@selenium';

const { JSDOM } = jsdom;

/**
 * 구글 번역
 * @param text 번역할 텍스트
 * @param translateTo 번역할 언어 코드
 * @param browser
 * @returns {Promise.<*>}
 */
const translate = async (text, translateTo, browser) => {
    if (!text || text === undefined || text === null || text === '') {
        log.warn('[googleTranslate.js] translateToEnglish method의 text parameter가 올바르지 않습니다');
        return null;
    }
    log.debug(`"${text}" will be translate to ${translateTo}`);
    await browser.url(`https://translate.google.co.kr/#auto/${translateTo}`);
    await browser.setValue('#source', text);
    await browser.click('#gt-submit');
    log.debug(`In translation...`);
    await browser.waitForText('#gt-res-dir-ctr', 60000);
    const result = await browser.getText('#gt-res-dir-ctr');
    log.debug(`Translation result ===> ${result}`);
    return result;
};

export const translateToKorean = async (text, browser) => {
    return await translate(text, 'ko', browser);
};

export const translateToEnglish = async (text, browser) => {
    return await translate(text, 'en', browser);
};

export const translateToJapanese = async (text, browser) => {
    return await translate(text, 'ja', browser);
};

export const translateToChinese = async (text, browser) => {
    return await translate(text, 'zh-CN', browser);
};

export default {
    runTranslateToKorean: async (text) => await run(async (browser) => {
        return await translateToKorean(text, browser);
    }),
    runTranslateToEnglish: async (text) => await run(async (browser) => {
        return await translateToEnglish(text, browser);
    }),
    runTranslateToJapanese: async (text) => await run(async (browser) => {
        return await translateToJapanese(text, browser);
    }),
    runTranslateToChinese: async (text) => await run(async (browser) => {
        return await translateToChinese(text, browser);
    }),
}