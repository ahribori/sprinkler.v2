import log from '@logger';
import { run } from '@selenium';

export const login = async (id, pw, browser) => {
    log.info('[tistory.login]', 'Start login process');

    await browser.url('https://www.tistory.com/auth/login');
    const loginFormExist = await browser.isExisting('#loginId');
    if (loginFormExist) {
        await browser.setValue('#loginId', id);
        await browser.setValue('#loginPw', pw);
        await browser.click('button.btn_login');
        await browser.pause(1000);
        log.info('[tistory.login]', 'Login');
    }

    const loginResult = await browser.isExisting('a.link_logout');
    log.info('[tistory.login]', `Login result: ${loginResult}`);
    return loginResult;
};

export default {
    runLogin: async (id, pw) => await run(async (browser) => {
        return login(id, pw, browser);
    }),
}