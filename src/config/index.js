const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

let doc = null;

try {
  doc = yaml.safeLoad(fs.readFileSync(path.resolve('config.yaml'), 'utf8'));
  if (!doc) {
    doc = null;
  }
} catch (e) {
  console.error(e.message);
}

if (!doc) {
  throw new Error('Invalid configurations. (check config.yaml)');
}

module.exports = doc;
