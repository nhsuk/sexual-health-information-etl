const config = require('./config');

function getMajorMinorVersion() {
  const parts = config.version.split('.');
  return `${parts[0]}.${parts[1]}`;
}

function asArray(obj) {
  return obj.constructor === Array ? obj : [obj];
}

function getDuplicates(arr) {
  return arr.filter((value, index, self) => self.indexOf(value) !== index);
}

function getId(field) {
  return field && field.split('/').pop();
}

module.exports = {
  asArray,
  getDuplicates,
  getId,
  getMajorMinorVersion,
};
