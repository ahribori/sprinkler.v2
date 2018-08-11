import fs from 'fs';
import path from 'path';
import log from '@logger';
import moment from 'moment';

const screenshotPath = path.resolve('logs/screenshot');
fs.existsSync(screenshotPath) || fs.mkdirSync(screenshotPath);

export const screenshot = async (browser) => {
    const screenshotFullPath = path.join(screenshotPath, `${moment().format('YYYYMMDD_hhmmss.SS')}.png`);
    await browser.saveScreenshot(screenshotFullPath);
    log.info('[screenshot.screenshot]', 'Save screenshot', screenshotFullPath);
};