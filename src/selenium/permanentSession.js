import log from '@logger';

const webdriverio = require('webdriverio');

let instance = null;

export default class PermanentSession {
    constructor(browserType = 'chrome') {
        if (!instance) {
            instance = this;
            this.transactionQueue = [];
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
            this.browser = webdriverio.remote(seleniumOptions);
            this.init();
        }
        return {
            enqueueTransaction: instance.enqueueTransaction,
        };
    }

    init = async () => {
        log.info('[permanentSession.init] Initialize browser');
        await this.browser.init();
        await this.pending();
    };

    pending = () => {
        setTimeout(async () => {
            if (this.transactionQueue.length === 0) {
                this.pending();
            } else {
                log.info('[permanentSession.pending]', 'Stop pending');
                const transaction = this.transactionQueue.shift();
                if (typeof transaction === 'function') {
                    log.info('[permanentSession.pending]', 'Execute transaction');
                    await transaction(this.browser);
                } else {
                    log.warn('[permanentSession.pending]', 'transaction is not a function');
                }
                log.info('[permanentSession.pending]', 'Start pending');
                this.pending();
            }
        }, 1000);
    };

    enqueueTransaction = (transaction) => {
        if (typeof transaction !== 'function') {
            const error = new Error('transaction is not a function');
            log.error('[permanentSession.enqueueTransaction]', error);
            throw error;
        }
        log.info('[permanentSession.enqueueTransaction]', 'Enqueue transaction');
        this.transactionQueue.push(transaction);
    };
}