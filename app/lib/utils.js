const config = require('./config');

function getMajorMinorVersion() {
  const parts = config.version.split('.');
  return `${parts[0]}.${parts[1]}`;
}

function getFilePrefix() {
  // prevent dev and test from over-writing production azure blob
  return process.env.NODE_ENV === 'production' ? '' : 'dev-';
}

function asArray(obj) {
  return obj.constructor === Array ? obj : [obj];
}

function getDuplicates(arr) {
  return arr.filter((value, index, self) => self.indexOf(value) !== index);
}

function getId(field) {
  return field && `${config.outputFile}-${field.split('/').pop()}`;
}

module.exports = {
  asArray,
  getDuplicates,
  getFilePrefix,
  getId,
  getMajorMinorVersion,
};
