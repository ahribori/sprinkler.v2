import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import clear from 'cli-clear';
import inquirer from 'inquirer';
import seleniumStandalone from './selenium/seleniumStandalone';
import crawlDaumHotTopic from './tasks/crawling/daumHotTopic';
import googleTranslate from './tasks/translate/googleTranslate';
import './schedules/test';

const MENU = {
    googleTranslate: '구글 번역',
    crawlDaumHotTopic: '다음 검색어 기반 크롤링'
};

const choices = [
    MENU.googleTranslate,
    MENU.crawlDaumHotTopic,
];
const runnablePath = path.resolve('__runnable__');
fs.existsSync(runnablePath) || fs.mkdirSync(runnablePath);
const __RUNNABLE__ = fs.readdirSync(path.resolve('__runnable__'));
__RUNNABLE__.forEach(value => {
    console.log(value);
    if (new RegExp(/.js$/).test(value)) {
        choices.unshift(value);

    }
});

seleniumStandalone.start(() => {

    const questions = [
        {
            type: 'list',
            name: 'menu',
            message: 'Select menu',
            choices,
        }
    ];

    inquirer.prompt(questions).then(async (answer) => {
        const { menu } = answer;
        switch (menu) {
            case MENU.googleTranslate: {
                await googleTranslate.runTranslateToChinese('hello world');
                break;
            }
            case MENU.crawlDaumHotTopic: {
                crawlDaumHotTopic.run();
                break;
            }
            default:
                require(path.join(path.resolve('__runnable__'), menu));
        }
    });
});
