import log from '@logger';
import { load } from '../../util/store';

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

export const tistory_oauth2_login = async ({ blog_identifier, id, pw, client_id, client_secret, redirect_uri }, browser) => {

    const STORE_NAME = `tistory_${blog_identifier}_access_token`;

    const cache = load(STORE_NAME);

    if (cache) {
        const now = new Date().getTime();
        const remain = cache.expiry_date - now;
        if (remain > 600000) {
            log.info('[tistory.tistory_oauth2_login] get access_token in cache');
            return cache;
        }
    }

    const url = `https://www.tistory.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${blog_identifier}`;
    await browser.url(url)
        .isExisting('#loginId')
        .setValue('#loginId', id)
        .setValue('#loginPw', pw)
        .click('button.btn_login');

    const isConfirmPage = await browser.isExisting('#contents > div.buttonWrap > button.confirm');
    if (isConfirmPage) {
        await browser.click('#contents > div.buttonWrap > button.confirm');
    }
    await browser.waitForExist('#oauth2_success', 30000);

    log.info('[tistory.tistory_oauth2_login]', 'Login');
    return load(STORE_NAME);
};
