import log from '@logger';

const webdriverio = require('webdriverio');

const desiredCapabilities = (browserType) => {
    if (typeof browserType !== 'string') {
        throw new Error('browserType is not a string');
    }
    switch (browserType.toUpperCase()) {
        case 'CHROME': {
            return {
                browserName: 'chrome',
                chromeOptions: process.env.NODE_env === 'production' ? {
                    args: ['headless'],
                } : {
                    args: [
                        '--window-size=800,600',
                    ],
                },
            }
        }
        default: {
            // TODO
        }
    }
};

export default {
    run: async (actions, options = {}) => {
        const seleniumOptions = {
            desiredCapabilities: desiredCapabilities(options.browserType || 'chrome'),
            protocol: process.env.SELENIUM_PROTOCOL || options.protocol || 'http',
            host: process.env.SELENIUM_HOST || options.host || '127.0.0.1',
            port: process.env.SELENIUM_PORT || options.port || '4444',
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