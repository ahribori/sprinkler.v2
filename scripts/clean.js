const kill = require('fkill');
const { snapshot } = require('process-list');

const killList = [];
const chromeRegex = new RegExp(/chromedriver/);
snapshot('pid', 'name').then(processes => {
    processes.forEach(process => {
        chromeRegex.test(process.name) && killList.push(process.pid);
    });
    kill(killList, {
        force: true
    });
});
