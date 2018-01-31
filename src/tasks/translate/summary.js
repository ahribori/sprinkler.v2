import log from '@logger';
import { run } from '@selenium';

export const summarize = async (text, browser) => {
    if (!text || text === undefined || text === null || text === '') {
        log.warn('[summary.summarize]', '(!text || text === undefined || text === null || text === \'\')');
        return null;
    }
    log.info('[summary.summarize]', `"${text.length > 100 ? text.substring(0, 100) + '...' : text}" Will be summarize`);
    await browser.url('https://summariz3.herokuapp.com');
    await browser.setValue('#home-content', text);
    await browser.click('button[type=submit]');
    log.info('[summary.summarize]', `In summary...`);
    const result = await browser.getText('#home-result ol li');
    console.log(result);
    log.info('[summary.summarize]', `Translation result: ${result}`);
    return result;
};

export default {
    runSummarize: async (text) => await run(async (browser) => {
        return await summarize(text, browser);
    }),
}