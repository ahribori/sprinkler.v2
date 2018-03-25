if (process.env.NODE_ENV === 'production') {
    require('./selenium/polyfill');
}

import kill from 'fkill';

const psList = require('ps-list');

require('./modules');

process.on('SIGINT', async () => {
    try {
        const killList = [];
        const chromeRegex = new RegExp(/chromedriver/);
        const processes = await psList();
        processes.forEach(process => {
            chromeRegex.test(process.name) && killList.push(process.pid);
        });
        await kill(killList, {
            force: true
        });
    } catch (e) {
        process.exit();
    }
    process.exit();
});