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
    this.manager = new TransactionManager();
    this.manager.pushTransaction(this);
  }

  browserReady() {}

  onError() {}
}

module.exports = Transaction;
