import webdriverio from '@selenium/webdriverio';

webdriverio.run(async (browser) => {
    await browser.url('');
    await browser.pause(3000);
});