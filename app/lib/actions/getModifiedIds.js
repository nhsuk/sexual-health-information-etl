const service = require('../syndicationService');
const mapId = require('../mappers/mapId');

function getModifiedIds(moment, pageNo) {
  return service.getModifiedSincePage(moment, pageNo)
    .then(mapId.fromResults);
}

module.exports = getModifiedIds;
