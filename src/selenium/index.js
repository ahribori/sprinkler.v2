if (process.env.NODE_ENV === 'production') {
    require('./polyfill');
}
import webdriverio from './webdriverio';

const run = webdriverio.run;

export {
    run
}