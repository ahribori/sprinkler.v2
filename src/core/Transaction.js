const cron = require('cron');
const TransactionManager = require('./TransactionManager');

const defaultOption = {
  logLevel: 'info',
  capabilities: {
    browserName: 'chrome',
  },
  protocol: 'http',
  host: '127.0.0.1',
  port: 4444,
};

const customOption = {
  enableAutoDeleteSession: true,
};

class Transaction {
  constructor(options) {
    this.options = Object.assign({}, defaultOption, customOption, options);
  }

  run() {
    const transactionManager = new TransactionManager();
    transactionManager.pushTransaction(this);
    return this;
  }

  schedule(cronTime) {
    let isValidCronTime = true;
    if (!cronTime) {
      isValidCronTime = false;
    }
    const splitCronTime = cronTime.toString().split(' ');
    if (splitCronTime.length !== 6) {
      isValidCronTime = false;
    }
    splitCronTime.forEach(fragment => {
      if (!/^([0-9,]+|\*)$/gi.test(fragment)) {
        isValidCronTime = false;
      }
    });
    if (!isValidCronTime) {
      console.error(`Invalid cronTime: ${cronTime}`);
      return this;
    }
    const CronJob = cron.CronJob;
    new CronJob(cronTime, this.run.bind(this)).start();
    return this;
  }

  onPush() {}

  onStart() {}

  onDone() {}

  onPop() {}

  onError(e) {
    console.error(e);
  }
}

module.exports = Transaction;
