import config from '@config';
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

const { script_ignore_pattern, process_kill_regexp } = config;
if (script_ignore_pattern) {
    console.log(`Ignore scripts by following patterns - ${color.red(script_ignore_pattern)}`);
}

const checkIgnore = (file) => {
    let ignore = false;
    for (let i = 0, length = script_ignore_pattern.length; i < length; i++) {
        const pattern = script_ignore_pattern[i];
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

for (let i = 0, length = filePathList.length; i < length; i++) {
    const file = filePathList[i];

    if (file !== 'index.js' && new RegExp(/(.js)$/).test(file)) {
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION
            if (!new RegExp(/(.dev.js)$/).test(file)) {
                if (script_ignore_pattern && checkIgnore(file)) {
                    continue;
                }
                require(path.join(scriptsPath, file));
                console.log(`Module loaded - ${color.cyan(file)}`);
            }
        } else {
            // DEVELOPMENT
            if (new RegExp(/(.dev.js)$/).test(file)) {
                if (script_ignore_pattern && checkIgnore(file)) {
                    continue;
                }
                require(path.join(scriptsPath, file));
                console.log(`Module loaded - ${color.yellow(file)}`)
            }
        }
    }
}

process.on('SIGINT', async () => {
    try {
        if (!process_kill_regexp) {
            return;
        }
        const killList = [];
        const killRegex = new RegExp(process_kill_regexp, 'gi');
        const processes = await psList();
        for (let i = 0; i < processes.length; i++) {
            const process = processes[i];
            killRegex.test(process.name) && killList.push(process.pid);
        }
        await kill(killList, {
            force: true,
        });
    } catch (e) {
        process.exit();
    }
    process.exit();
});
