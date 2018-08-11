import fs from 'fs';
import path from 'path';
import log from '@logger';
import Cron from '@cron';

const successLogPath = path.resolve('logs/success.log');
fs.existsSync(successLogPath) || fs.writeFileSync(successLogPath, JSON.stringify({}), 'utf-8');

const successKeywordExpiryTime = 1000 * 60 * 60 * 24 * 30;

const job = new Cron('0 0 0 * * *', () => {
    log.info('Success log 정리 배치 시작');
    const file = fs.readFileSync(successLogPath);
    const successLogTree = JSON.parse(file);
    const current = Date.now();

    for (let key in successLogTree) {
        if (successLogTree.hasOwnProperty(key)) {
            if (current - successLogTree[key] > successKeywordExpiryTime) {
                delete successLogTree[key];
                log.info(`success.log에서 키워드 ${key} 삭제`);
            }
        }
    }
    fs.writeFileSync(successLogPath, JSON.stringify(successLogTree, null, '\t'), 'utf-8');
});

job.start();
