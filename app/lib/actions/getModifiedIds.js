const service = require('../syndicationService');
const mapId = require('../mappers/mapId');

async function getModifiedIds(moment, pageNo) {
  try {
    const pageJson = await service.getModifiedSincePage(moment, pageNo);
    return mapId.fromResults(pageJson);
  } catch (ex) {
    if (ex.message.includes(' 404')) {
      return [];
    }
    throw ex;
  }
}

module.exports = getModifiedIds;
