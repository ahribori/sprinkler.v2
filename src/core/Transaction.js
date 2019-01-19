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
  }

  schedule(cron) {}

  onPush() {}

  onStart() {}

  onDone() {}

  onPop() {}

  onError(e) {
    console.error(e);
  }
}

module.exports = Transaction;
