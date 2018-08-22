import log from '@logger';
import TransactionManager from './TransactionManager';

const webdriverio = require('webdriverio');
const manager = new TransactionManager();

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
                        headless ? 'headless' : '--window-size=1600,900',
                    ],
                },
            }
        }
        case 'FIREFOX': {
            return {
                browserName: 'firefox',
                'moz:firefoxOptions': {
                    args: process.env.NODE_env === 'production' ? ['-headless'] : [],
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
            desiredCapabilities: desiredCapabilities(options.browserType || 'firefox', options.headless),
            protocol: options.protocol || 'http',
            host: options.host || '127.0.0.1',
            port: options.port || '4444',
        };

        const { callback } = options;

        const browser = webdriverio.remote(seleniumOptions);

        const transaction = async () => {
            log.info('----- RUN -----');
            try {
                await browser.init();
                await actions(browser);
                await browser.end();
                if (typeof callback === 'function') {
                    callback(true);
                }
            } catch (e) {
                if (typeof callback === 'function') {
                    callback(false);
                }
                throw e;
            }
            log.info('----- DONE -----');
        };

        manager.pushTransaction(transaction);
    }
}
