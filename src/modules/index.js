import fs from 'fs';
import path from 'path';

const filePathList = fs.readdirSync(__dirname);
filePathList.forEach(file => {
    if (file !== 'index.js' && new RegExp(/(.js)$/).test(file)) {
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION
            if (!new RegExp(/(.dev.js)$/).test(file)) {
                require(path.join(__dirname, file));
                console.log(file);
            }
        } else {
            // DEVELOPMENT
            if (new RegExp(/(.dev.js)$/).test(file)) {
                require(path.join(__dirname, file));
                console.log(file);
            }
        }
    }
});