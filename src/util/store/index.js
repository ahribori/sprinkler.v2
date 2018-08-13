import fs from 'fs';
import path from 'path';

const STORE_DIR_PATH = path.resolve('store');
fs.existsSync(STORE_DIR_PATH) || fs.mkdirSync(STORE_DIR_PATH);

export const save = (name = 'default', object = {}) => {
    const STORE_PATH = path.join(STORE_DIR_PATH, `${name}.json`);
    fs.writeFileSync(STORE_PATH, JSON.stringify(object, null, '\t'), 'utf-8');
};

export const load = (name) => {
    const STORE_PATH = path.join(STORE_DIR_PATH, `${name}.json`);
    const exist = fs.existsSync(STORE_PATH);
    if (!exist) {
        return null;
    }
    return JSON.parse(fs.readFileSync(STORE_PATH));
};
