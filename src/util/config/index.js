import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import logger from '../logger';

let doc = null;

try {
    doc = yaml.safeLoad(fs.readFileSync(path.resolve('config.yml'), 'utf8'));
    if (!doc) {
        doc = null;
    }
} catch (e) {
    logger.error(e.message);
}

if (!doc) {
    throw new Error('Invalid configurations. (check config.yml)');
}

export default doc;
