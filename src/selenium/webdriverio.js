import log from '@logger';

const webdriverio = require('webdriverio');

const desiredCapabilities = (browserType, headless) => {
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
                        headless ? 'headless' : '--window-size=800,600',
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
            desiredCapabilities: desiredCapabilities(options.browserType || 'chrome', options.headless),
            protocol: options.protocol || 'http',
            host: options.host || '127.0.0.1',
            port: options.port || '4444',
        };
        log.info('============ RUN ============');
        const browser = webdriverio.remote(seleniumOptions);
        try {
            await browser.init();
            const results = await actions(browser);
            await browser.end();
            log.info('============ DONE ============');
            return results;
        } catch (e) {
            log.info('############### Error ###############');
            log.error(e);
            try {
                await browser.end();
            } catch (e) {
                log.error('[webdriverio.browser.end]', e);
            }
            log.info('============ DONE WITH ERROR ============');
        }
    }
}