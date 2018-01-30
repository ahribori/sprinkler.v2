if (process.env.NODE_ENV === 'production') {
    require('./polyfill');
}
import selenium from 'selenium-standalone';
let seleniumStandaloneInstance = null;

export default {
    start: (callback) => {
        selenium.start((err, child) => {
            seleniumStandaloneInstance = child;
            // child.stderr.on('data', function (data) {
            //     console.log(data.toString());
            // });
            if (typeof callback === 'function') {
                callback();
            }
        });
    },
    getInstance: () => {
        return seleniumStandaloneInstance;
    },
    kill: () => {
        if (seleniumStandaloneInstance) {
            seleniumStandaloneInstance.kill();
        }
    }
}