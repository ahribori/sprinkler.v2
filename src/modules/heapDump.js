import heapdump from 'heapdump';
import fs from 'fs';
import path from 'path';
import log from '@logger';
import cron from '@cron';

const job = new cron('0 0 0,6,12,18 * * *', () => {
    const dumpDir = path.resolve('dump');
    const now = new Date();
    const current =
        `${now.getFullYear() +
        (`0${now.getMonth() + 1}`).slice(-2) +
        (`0${now.getDate()}`).slice(-2)}_${
            (`0${now.getHours()}`).slice(-2)
            }${(`0${now.getMinutes()}`).slice(-2)
            }${(`0${now.getSeconds()}`).slice(-2)}`;

    fs.existsSync(dumpDir) || fs.mkdirSync(dumpDir);
    log.info(`히프덤프 스냅샷 ${current}.heapsnapshot 을 생성합니다`);
    heapdump.writeSnapshot(`${dumpDir}/${current}.heapsnapshot`);
});
job.start();
