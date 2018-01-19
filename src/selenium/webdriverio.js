const webdriverio = require('webdriverio');

export default {
    run: async (actions, browserType = 'chrome') => {
        const seleniumOptions = {
            desiredCapabilities: {
                browserName: browserType,
                chromeOptions: {
                    args: ['headless'],
                },
            },
            protocol: process.env.SELENIUM_PROTOCOL || 'http',
            host: process.env.SELENIUM_HOST || '127.0.0.1',
            port: process.env.SELENIUM_PORT || 4444,
        };
        const browser = webdriverio.remote(seleniumOptions);
        await browser.init();
        await actions(browser);
        await browser.end();
    }
}