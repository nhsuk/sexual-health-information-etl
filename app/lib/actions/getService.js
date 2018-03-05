const syndicationService = require('../syndicationService');
const mapService = require('../mappers/mapService');
const utils = require('../utils');

function getService(id) {
  return syndicationService.getPage(utils.getSyndicationId(id)).then(mapService);
}

module.exports = getService;
