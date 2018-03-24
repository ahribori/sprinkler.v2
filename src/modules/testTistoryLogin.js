require('dotenv').config();
import { run } from '@selenium';
import { login } from '../tasks/login/tistory';

run(async (browser) => {
    await login(process.env.tistoryId, process.env.tistoryPw, browser);
    await browser.pause(10000);
});