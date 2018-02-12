export default (browserType = 'chrome') => {
    return {
        browserName: browserType,
        chromeOptions: process.env.NODE_env === 'production' ? {
            args: ['headless'],
        } : {
            args: [
                '--window-size=800,600',
            ],
        },
    }
}