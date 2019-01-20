require('winston-daily-rotate-file');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, printf } = format;

const logFormat = printf(info => {
  const { timestamp, level, message } = info;
  return `${new Date(timestamp).toLocaleString()} ${level}: ${message}`;
});

const dailyRotateCombineTransport = new transports.DailyRotateFile({
  level: 'info',
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  dirname: './log',
  format: combine(timestamp(), logFormat),
});

const dailyRotateErrorTransport = new transports.DailyRotateFile({
  level: 'error',
  filename: '%DATE%.error.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  dirname: './log',
  format: combine(timestamp(), logFormat),
});

dailyRotateCombineTransport.on('rotate', (oldFilename, newFilename) => {
  // do something fun
});

dailyRotateErrorTransport.on('rotate', (oldFilename, newFilename) => {
  // do something fun
});

const consoleTransport = new transports.Console({
  format: combine(timestamp(), colorize(), logFormat),
});

const logger = createLogger({
  transports: [dailyRotateCombineTransport, dailyRotateErrorTransport, consoleTransport],
});

export default logger;
