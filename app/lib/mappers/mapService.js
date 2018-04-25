const utils = require('../utils');
const mapLocation = require('./mapLocation');
const mapNonCore = require('./mapNonCoreElements');
const mapContacts = require('./mapContacts');
const mapGsdId = require('./mapGsdId');
const Entities = require('html-entities').AllHtmlEntities;

const entities = new Entities();
const htmlQuoteRegex = /&quot;/g;

function mapService(rawService) {
  const entry = rawService.feed.entry;
  const service = entry.content.service;
  return {
    address: {
      addressLines: service.address.addressLine,
      postcode: service.address.postcode,
    },
    contacts: mapContacts(service),
    generalNotes: entities.decode(mapNonCore.generalNotes(service.nonCoreElements).replace(htmlQuoteRegex, '')).trim(),
    gsdId: mapGsdId(rawService),
    id: utils.getId(entry.id),
    location: mapLocation(service),
    name: service.name._,
    openingTimes: {
      description: entities.decode(mapNonCore.openingTimes(service.nonCoreElements).replace(htmlQuoteRegex, '')).trim(),
    },
    serviceDetails: entities.decode(mapNonCore.serviceDetails(service.nonCoreElements).replace(htmlQuoteRegex, '')).trim(),
    serviceType: service.type._,
    venueType: mapNonCore.venueType(service.nonCoreElements),
  };
}

module.exports = mapService;
