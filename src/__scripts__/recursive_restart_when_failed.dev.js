import { run } from '../selenium';

function recursiveTask() {
    run(async () => {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('망했어!'))
            }, 3000);
        });
    }, {
        callback: (success) => {
            if (!success) {
                recursiveTask();
            }
        },
    });
}

// recursiveTask();
