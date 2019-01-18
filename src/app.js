const fs = require('fs');
const path = require('path');
const { scriptsDirPath } = require('./config/path');
const { scripts } = require('./config');
const { includePattern, excludePattern } = scripts;

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

loadScript(scriptsDirPath);
