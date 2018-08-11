import TransactionManager from '../selenium/TransactionManager';

const manager = new TransactionManager();

const transaction = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('3초짜리 작업');
        resolve();
    }, 3000);
});

// setInterval(() => {
//     manager.pushTransaction(transaction);
// }, 5000);