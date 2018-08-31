import config from '@config';
import fs from 'fs';
import path from 'path';
import fkill from 'fkill';
import color from 'colors';

if (process.env.NODE_ENV === 'production') {
    require('./selenium/polyfill');
}

const { include, exclude, kill } = config;

if (include) {
    console.log(`Include scripts by following patterns - ${color.cyan(include)}`);
}
if (exclude) {
    console.log(`Exclude scripts by following patterns - ${color.red(exclude)}`);
}

const checkInclude = (file) => {
    let inc = false;
    for (let i = 0, length = include.length; i < length; i++) {
        const pattern = include[i];
        if (new RegExp(pattern).test(file)) {
            inc = true;
            break;
        }
    }
    if (inc) {
        console.log(`Include - ${color.cyan(file)}`);
    }
    return inc;
};

const checkExclude = (file) => {
    let ignore = false;
    for (let i = 0, length = exclude.length; i < length; i++) {
        const pattern = exclude[i];
        if (new RegExp(pattern).test(file)) {
            ignore = true;
            break;
        }
    }
    if (ignore) {
        console.log(`Ignore - ${color.red(file)}`);
    }
    return ignore;
};

const psList = require('ps-list');
const scriptsPath = path.resolve(`${__dirname}/__scripts__`);
const filePathList = fs.readdirSync(scriptsPath).filter(file => include && Array.isArray(include) ? checkInclude(file) : true);
const scriptLoaded = [];


for (let i = 0, length = filePathList.length; i < length; i++) {
    const file = filePathList[i];

    if (file !== 'index.js' && new RegExp(/(.js)$/).test(file)) {
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION
            if (!new RegExp(/(.dev.js)$/).test(file)) {
                if (exclude && checkExclude(file)) {
                    continue;
                }
                scriptLoaded.push(file);
                require(path.join(scriptsPath, file));
            }
        } else {
            // DEVELOPMENT
            if (new RegExp(/(.dev.js)$/).test(file)) {
                if (exclude && checkExclude(file)) {
                    continue;
                }
                scriptLoaded.push(file);
                require(path.join(scriptsPath, file));
            }
        }
    }
}
console.log(`Scripts loaded - ${color.cyan(scriptLoaded)}`)

process.on('SIGINT', async () => {
    try {
        if (!kill) {
            return;
        }
        const killList = [];
        const killRegex = new RegExp(kill, 'gi');
        const processes = await psList();
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            killRegex.test(process.name) && killList.push(process.pid);
        }
        await fkill(killList, {
            force: true,
        });
    } catch (e) {
        process.exit();
    }
    process.exit();
});
