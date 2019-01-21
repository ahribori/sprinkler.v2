import Transaction from '../core/Transaction';

class ExampleTransaction extends Transaction {
  async task(browser) {
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

const exampleTransaction = new ExampleTransaction({ logLevel: 'error', browser: 'firefox' }).run();

// exampleTransaction.schedule('00 * * * * *');
