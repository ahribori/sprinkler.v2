import log from '@logger';
import conf from '@config';
import TransactionManager from './TransactionManager';

const webdriverio = require('webdriverio');
const manager = new TransactionManager();

const { defaultBrowser } = conf;

const desiredCapabilities = (browserType, headless) => {
    if (typeof browserType !== 'string') {
        throw new Error('browserType is not a string');
    }
    let headlessEnable = false;
    if (process.env.NODE_ENV === 'production') {
        headlessEnable = true;
    }
    if (headless === true) {
        headlessEnable = true;
    } else if (headless === false) {
        headlessEnable = false;
    }

    switch (browserType.toUpperCase()) {
        case 'CHROME': {
            return {
                browserName: 'chrome',
                chromeOptions: {
                    args: [
                        headlessEnable ? 'headless' : '--window-size=1600,900',
                    ],
                },
            }
        }
        case 'FIREFOX': {
            return {
                browserName: 'firefox',
                'moz:firefoxOptions': {
                    args: headlessEnable ? ['-headless'] : [],
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
            desiredCapabilities: desiredCapabilities(options.browserType || defaultBrowser || 'firefox', options.headless),
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
    },
}
