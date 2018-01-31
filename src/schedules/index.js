import fs from 'fs';
import path from 'path';

const scheduleFiles = fs.readdirSync(__dirname);
const filter = new RegExp(/(.js)$/);
scheduleFiles.forEach(file => {
    if (file !== 'index.js' && filter.test(file)) {
        require(path.join(__dirname, file));
    }
});
