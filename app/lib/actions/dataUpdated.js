const service = require('../syndicationService');

async function dataUpdated(moment) {
  try {
    await service.getModifiedSincePage(moment, 1);
    return true;
  } catch (ex) {
    if (ex.message.includes(' 404')) {
      return false;
    }
    throw ex;
  }
}

module.exports = dataUpdated;
