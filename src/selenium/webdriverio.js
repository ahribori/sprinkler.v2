const webdriverio = require('webdriverio');

export default {
    getBrowser: (browserName) => {
        return webdriverio.remote({
            desiredCapabilities: {
                browserName,
            },
        });
    }
}