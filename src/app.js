import kill from 'fkill';
import seleniumStandalone from '@selenium/seleniumStandalone';

const { snapshot } = require('process-list');

seleniumStandalone.start(() => {
    require('./runnable');
});

process.on('SIGINT', async () => {
    try {
        const killList = [];
        const chromeRegex = new RegExp(/chromedriver/);
        const processes = await snapshot('pid', 'name');
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
