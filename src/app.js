import logger from './util/logger';

require('module-alias/register');
const Selenium = require('selenium-standalone');
const fs = require('fs');
const path = require('path');
const { scriptsDirPath } = require('./config/path');
const { scripts, selenium } = require('./config');
const { includePattern, excludePattern } = scripts;
const { standalone } = selenium;

function loadScript(_path) {
  const isDirectory = fs.lstatSync(_path).isDirectory();
  if (isDirectory) {
    const children = fs.readdirSync(_path);
    children.forEach(item => {
      const newPath = path.join(_path, item);
      loadScript(newPath);
    });
  } else {
    const splitPath = _path.split(path.sep);
    const fileName = splitPath[splitPath.length - 1];
    if (_path.endsWith('.js')) {
      if (includePattern) {
        if (
          !new RegExp(includePattern, 'gi').test(fileName) ||
          new RegExp(excludePattern, 'gi').test(fileName)
        ) {
          return;
        }
      } else {
        if (new RegExp(excludePattern, 'gi').test(fileName)) {
          return;
        }
      }
      require(_path);
    }
  }
}

if (standalone === true) {
  Selenium.start((err, child) => {
    if (err) {
      return console.error(err);
    }
    logger.info('Selenium standalone server started.');
    child.stderr.on('data', data => {
      // console.log(data.toString());
    });
    loadScript(scriptsDirPath);
  });
} else {
  loadScript(scriptsDirPath);
}
