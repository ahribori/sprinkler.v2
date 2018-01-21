import log from '../logger';

const webdriverio = require('webdriverio');

export default {
    run: async (actions, browserType = 'chrome') => {
        const seleniumOptions = {
            desiredCapabilities: {
                browserName: browserType,
                chromeOptions: process.env.NODE_env === 'production' ? {
                    args: ['headless'],
                } : {},
            },
            protocol: process.env.SELENIUM_PROTOCOL || 'http',
            host: process.env.SELENIUM_HOST || '127.0.0.1',
            port: process.env.SELENIUM_PORT || 4444,
        };
        try {
            log.info('============ RUN ============');
            const browser = webdriverio.remote(seleniumOptions);
            await browser.init();
            const results = await actions(browser);
            await browser.end();
            log.info('============ DONE ============');
            return results;
        } catch (e) {
            log.error(e);
        }
    }
}