import config from '@config';
import { run } from '../selenium';
import { heaven } from '../modules/post/heaven';

const r = () => {
    run(async browser => {
        await heaven(browser);
    });
};

// r();
