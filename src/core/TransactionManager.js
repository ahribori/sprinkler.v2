const { remote } = require('webdriverio');
const EventEmitter = require('events');
const config = require('../config');
const { core: coreConfig } = config;
const { maxSession: maxSessionConfig } = coreConfig || {};

const EVENT_TYPE = {
  PUSH: 'push',
  POP: 'pop',
};

const STATUS = {
  WAITING: 'WAITING',
  RUNNING: 'RUNNING',
};

let instance = null;

class TransactionManager {
  constructor() {
    if (!instance) {
      instance = this;
      this.event = new EventEmitter();
      this.transactionQueue = [];
      this.status = STATUS.WAITING;
      this.maxSession = maxSessionConfig || 1;
      this.currentSessionCount = 0;
      this.bindEventListener();
    }
    return instance;
  }

  async executeTransaction() {
    console.log('executeTransaction');
    if (this.status !== STATUS.RUNNING) {
      if (this.transactionQueue.length === 0) {
        return;
      }
      const transaction = this.transactionQueue[0];
      const { browserReady, onError, options } = transaction;
      const { enableAutoDeleteSession, ...otherOptions } = options;

      if (
        browserReady &&
        typeof browserReady === 'function' &&
        browserReady.constructor.name === 'AsyncFunction'
      ) {
        this.status = STATUS.RUNNING;
        const browser = await remote(otherOptions);

        await browserReady(browser);
        if (enableAutoDeleteSession) {
          await browser.deleteSession();
        }
      }

      this.status = STATUS.WAITING;
      this.popTransaction();
      return this.executeTransaction();
    }
  }

  pushTransaction(transaction) {
    console.log('pushTransaction');
    this.transactionQueue.push(transaction);
    this.event.emit(EVENT_TYPE.PUSH);
  }

  popTransaction() {
    console.log('popTransaction');
    this.transactionQueue.shift();
    this.event.emit(EVENT_TYPE.POP);
  }

  onPush() {
    console.log('onPush');
    this.executeTransaction();
  }

  onTransactionStart() {}

  onTransactionEnd() {}

  onPop() {
    console.log('onPop');
  }

  bindEventListener() {
    this.event.on('push', this.onPush.bind(this));
    this.event.on('start', this.onTransactionStart.bind(this));
    this.event.on('end', this.onTransactionEnd.bind(this));
    this.event.on('pop', this.onPop.bind(this));
  }
}

module.exports = TransactionManager;
