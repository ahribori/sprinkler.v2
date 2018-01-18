import chalk from 'chalk';
import clear from 'cli-clear';
import inquirer from 'inquirer';
import seleniumStandalone from './selenium/seleniumStandalone';
import crawlDaumHotTopic from './crawling/daumHotTopic';

seleniumStandalone.start(() => {
    clear();

    const questions = [
        {
            type: 'list',
            name: 'menu',
            message: 'Select menu',
            choices: ['daumHotTopic']
        }
    ];

    inquirer.prompt(questions).then((answer) => {
        const { menu } = answer;
        switch (menu) {
            case 'daumHotTopic': {
                crawlDaumHotTopic.run();
                break;
            }
            default:
        }
    });
});
