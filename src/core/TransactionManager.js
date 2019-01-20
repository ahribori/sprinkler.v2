import { remote } from 'webdriverio';
import EventEmitter from 'events';
import Transaction from './Transaction';
import config from '../config';

const { core: coreConfig } = config;
const { maxSession: maxSessionConfig } = coreConfig || {};

const EVENT_TYPE = {
  PUSH: 'push',
  POP: 'pop',
  START: 'start',
  DONE: 'done',
};

let instance = null;

class TransactionManager {
  constructor() {
    if (!instance) {
      instance = this;
      this.event = new EventEmitter();
      this.transactionQueue = [];
      this.maxSession = maxSessionConfig || 1;
      this.currentSessionCount = 0;
      this.bindEventListener();
    }
    return instance;
  }

  executeTransaction = async () => {
    if (this.transactionQueue.length === 0) {
      return;
    }

    if (this.currentSessionCount < this.maxSession) {
      const transaction = this.popTransaction();
      this.event.emit(EVENT_TYPE.START, transaction);
      const { task, onError, options } = transaction;
      const { enableAutoDeleteSession, ...otherOptions } = options;

      if (task && typeof task === 'function' && task.constructor.name === 'AsyncFunction') {
        let browser;
        try {
          browser = await remote(otherOptions);
          this.currentSessionCount++;
        } catch (e) {
          return onError(e);
        }

        try {
          await task(browser);
          if (enableAutoDeleteSession) {
            await browser.deleteSession();
          }
        } catch (e) {
          onError(e);
          try {
            await browser.deleteSession();
          } catch (e) {
            onError(e);
          }
        }

        this.currentSessionCount--;
        this.event.emit(EVENT_TYPE.DONE, transaction);
      } else {
        console.warn('Required: Async function task() should be implement');
      }
      return this.executeTransaction();
    }
  };

  pushTransaction = transaction => {
    if (transaction instanceof Transaction) {
      this.transactionQueue.push(transaction);
      this.executeTransaction();
      this.event.emit(EVENT_TYPE.PUSH, transaction);
    }
  };

  popTransaction = () => {
    const transaction = this.transactionQueue.shift();
    this.event.emit(EVENT_TYPE.POP, transaction);
    return transaction;
  };

  onPush = transaction => {
    const { onPush } = transaction;
    if (onPush && typeof onPush === 'function') {
      onPush();
    }
  };

  onStart = transaction => {
    const { onStart } = transaction;
    if (onStart && typeof onStart === 'function') {
      onStart();
    }
  };

  onDone = transaction => {
    const { onDone } = transaction;
    if (onDone && typeof onDone === 'function') {
      onDone();
    }
  };

  onPop = transaction => {
    const { onPop } = transaction;
    if (onPop && typeof onPop === 'function') {
      onPop();
    }
  };

  bindEventListener = () => {
    this.event.on('push', this.onPush);
    this.event.on('start', this.onStart);
    this.event.on('done', this.onDone);
    this.event.on('pop', this.onPop);
  };
}

export default TransactionManager;
