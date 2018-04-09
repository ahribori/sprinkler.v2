import path from 'path';
import fs from 'fs';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logDirectory = path.resolve('logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const tsFormat = () => (new Date()).toLocaleTimeString();

// error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
const logger = new (winston.Logger)({
    level: 'info',
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        }),
        new (winston.transports.DailyRotateFile)({
            filename: `${logDirectory}/log`,
            timestamp: tsFormat,
            json: false,
            datePattern: 'yyyy-MM-dd.',
            prepend: true,
            maxDays: 7,
            localTime: true,
            level: 'info',
        }),
    ],
});

export default logger;