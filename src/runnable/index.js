import fs from 'fs';
import path from 'path';
import Prompt from 'prompt-checkbox';
import PermanentSession from '@selenium/permanentSession';

const filePathList = fs.readdirSync(__dirname);
const filter = process.env.NODE_ENV === 'production' ? new RegExp(/(.js)$/) : new RegExp(/(.dev.js)$/);
const files = [];
filePathList.forEach(file => {
    if (file !== 'index.js' && filter.test(file)) {
        files.push(file);
    }
});

if (process.env.NODE_ENV === 'production') {
    const prompt = new Prompt({
        name: 'Check runnable scripts',
        message: 'Which scripts do you want to execute?',
        radio: true,
        choices: files,
        default: files,
    });
    prompt.run()
        .then(answers => {
            prompt.ui.close();
            new PermanentSession();
            answers.forEach(answer => {
                require(path.join(__dirname, answer));
            });
        })
        .catch(error => {
            console.error(error);
        })
} else {
    new PermanentSession();
    files.forEach(file => {
        require(path.join(__dirname, file));
    })
}

