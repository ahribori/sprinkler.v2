import cron from 'cron';
import config from '../config';
import TransactionManager from './TransactionManager';

const { selenium } = config;
const { protocol, host, port, browser, logLevel } = selenium;

class Transaction {
  getCapabilities = ({ headless = true }) => ({
    chrome: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: headless ? ['--headless'] : ['--window-size=1600,900'],
      },
    },
    firefox: {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: headless ? ['--headless'] : [],
      },
    },
  });

  customOption = {
    enableAutoDeleteSession: true,
  };

  constructor(options) {
    this.options = Object.assign(
      {},
      {
        logLevel: logLevel || 'info',
        capabilities:
          this.getCapabilities(options)[options.browser] ||
          this.getCapabilities(options)[browser] ||
          this.getCapabilities(options)['chrome'],
        protocol: protocol || 'http',
        host: host || '127.0.0.1',
        port: port || 4444,
      },
      this.customOption,
      options,
    );
    console.log(JSON.stringify(this.options, null, 2));
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

  batch(cronTime) {
    return this.schedule(cronTime);
  }

  onPush() {}

  onStart() {}

  onDone() {}

  onPop() {}

  onError(e) {
    console.error(e);
  }
}
export default Transaction;
