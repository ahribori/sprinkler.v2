import Transaction from '../core/Transaction';
import { translateToJapanese } from '../modules/translate/googleTranslate';

class ExampleTransaction extends Transaction {
  async task(browser) {
    const result = await translateToJapanese('좋은 아침입니다.', browser);
    console.log(result);
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
