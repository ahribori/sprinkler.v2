import kill from 'fkill';
import seleniumStandalone from '@selenium/seleniumStandalone';

const psList = require('ps-list');

seleniumStandalone.start(() => {
    require('./modules');
});

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
