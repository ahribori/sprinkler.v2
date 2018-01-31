import fs from 'fs';
import path from 'path';

const currentPath = path.resolve('src/schedules');
const scheduleFiles = fs.readdirSync(currentPath);
const filter = new RegExp(/(.js)$/);
scheduleFiles.forEach(file => {
    if (file !== 'index.js' && filter.test(file)) {
        require(path.join(currentPath, file));
    }
});
