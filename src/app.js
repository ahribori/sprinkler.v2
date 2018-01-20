import chalk from 'chalk';
import clear from 'cli-clear';
import inquirer from 'inquirer';
import seleniumStandalone from './selenium/seleniumStandalone';
import crawlDaumHotTopic from './tasks/crawling/daumHotTopic';
import googleTranslate from './tasks/translate/googleTranslate';

const MENU = {
    googleTranslate: '구글 번역',
    crawlDaumHotTopic: '다음 검색어 기반 크롤링'
};

seleniumStandalone.start(() => {
    clear();

    const questions = [
        {
            type: 'list',
            name: 'menu',
            message: 'Select menu',
            choices: [
                MENU.googleTranslate,
                MENU.crawlDaumHotTopic,
            ]
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
        }
    });
});
