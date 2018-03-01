const utils = require('../utils');

function fromSummary(serviceSummary) {
  return utils.getId(serviceSummary.id);
}

function fromResults(results) {
  return results.feed && results.feed.entry ?
    utils.asArray(results.feed.entry).map(fromSummary).filter(o => o !== undefined) : [];
}

module.exports = {
  fromResults,
  fromSummary,
};
