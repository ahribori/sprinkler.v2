import log from '@logger';
import desiredCapabilites from './desiredCapabilities';

const webdriverio = require('webdriverio');

let instance = null;

export default class PermanentSession {
    constructor(browserType = 'chrome') {
        if (!instance) {
            instance = this;
            this.killInterval = 1000 * 60 * 60 * 24; // 24시간 마다 세션 초기화
            this.transactionQueue = [];
            const seleniumOptions = {
                desiredCapabilities: desiredCapabilites(),
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
        this.initializedTime = new Date().getTime();
        console.log(this.initializedTime);
        await this.browser.init();
        await this.pending();
        log.info('[permanentSession.init]', 'Start pending');
    };

    kill = async () => {
        log.info('[permanentSession.kill] Kill browser');
        await this.browser.end();
    };

    pending = () => {
        setTimeout(async () => {
            const currentTime = new Date().getTime();
            if (currentTime - this.initializedTime > this.killInterval) {
                await this.kill();
                await this.init();
                return;
            }
            if (this.transactionQueue.length === 0) {
                this.pending();
            } else {
                log.info('[permanentSession.pending]', 'Stop pending');
                const transaction = this.transactionQueue.shift();
                log.info('[permanentSession.pending]', `Dequeue transaction (queue=${this.transactionQueue.length})`);
                if (typeof transaction === 'function') {
                    log.info('[permanentSession.pending]', 'Execute transaction');
                    try {
                        await transaction(this.browser);
                    } catch (e) {
                        log.error(e);
                    }
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
        this.transactionQueue.push(transaction);
        log.info('[permanentSession.enqueueTransaction]', `Enqueue transaction (queue=${this.transactionQueue.length})`);
    };
}
