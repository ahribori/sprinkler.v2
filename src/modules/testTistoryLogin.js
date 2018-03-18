require('dotenv').config();
import webdriverio from '@selenium/webdriverio';
import { login } from '../tasks/login/tistory';

webdriverio.run(async (browser) => {
    await login(process.env.tistoryId, process.env.tistoryPw, browser);
    await browser.pause(60000);
});