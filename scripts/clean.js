const kill = require('fkill');
const psList = require('ps-list');

const killList = [];
const chromeRegex = new RegExp(/chromedriver/);
psList().then(processes => {
    processes.forEach(process => {
        chromeRegex.test(process.name) && killList.push(process.pid);
    });
    kill(killList, {
        force: true
    });
});
