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
  return field && `${config.outputFile}-${field.split('/').pop()}`;
}

function getSyndicationId(id) {
  return id.replace(`${config.outputFile}-`, '');
}

module.exports = {
  asArray,
  getDuplicates,
  getId,
  getMajorMinorVersion,
  getSyndicationId,
};
