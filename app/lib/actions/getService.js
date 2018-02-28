const syndicationService = require('../syndicationService');
const mapService = require('../mappers/mapService');

function getPharmacy(id) {
  return syndicationService.getPage(id).then(mapService);
}

module.exports = getPharmacy;
