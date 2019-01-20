const Transaction = require('../core/Transaction');

class ExampleTransaction extends Transaction {
  async task(browser) {
    await browser.url('http://naver.com');
  }

  onStart() {
    console.log('ExampleTransaction start.');
  }

  onDone() {
    console.log('ExampleTransaction done.');
  }

  onError(e) {
    console.log(e);
  }
}

const exampleTransaction = new ExampleTransaction({ logLevel: 'error' });

// exampleTransaction.schedule('00 * * * * *');