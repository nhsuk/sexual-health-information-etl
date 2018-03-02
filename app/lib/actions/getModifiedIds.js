const service = require('../syndicationService');
const mapIds = require('../mappers/mapIds');

async function getModifiedIds(moment, pageNo) {
  try {
    const pageJson = await service.getModifiedSincePage(moment, pageNo);
    return mapIds(pageJson);
  } catch (ex) {
    if (ex.message.includes(' 404')) {
      return [];
    }
    throw ex;
  }
}

module.exports = getModifiedIds;
