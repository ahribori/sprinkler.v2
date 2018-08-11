import fs from 'fs';
import path from 'path';
import kill from 'fkill';
import color from 'colors';

if (process.env.NODE_ENV === 'production') {
    require('./selenium/polyfill');
}

const psList = require('ps-list');
const scriptsPath = path.resolve(`${__dirname}/__scripts__`);
const filePathList = fs.readdirSync(scriptsPath);

filePathList.forEach(file => {
    if (file !== 'index.js' && new RegExp(/(.js)$/).test(file)) {
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION
            if (!new RegExp(/(.dev.js)$/).test(file)) {
                require(path.join(scriptsPath, file));
                console.log(`Module loaded - ${color.cyan(file)}`);
            }
        } else {
            // DEVELOPMENT
            if (new RegExp(/(.dev.js)$/).test(file)) {
                require(path.join(scriptsPath, file));
                console.log(`Module loaded - ${color.yellow(file)}`)
            }
        }
    }
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