const utils = require('../utils');
const mapLocation = require('./mapLocation');
const mapNonCore = require('./mapNonCoreElements');
const mapContacts = require('./mapContacts');

function mapService(rawService) {
  const entry = rawService.feed.entry;
  const service = entry.content.service;
  return {
    id: utils.getId(entry.id),
    name: service.name._,
    type: service.type._,
    address: {
      addressLines: service.address.addressLine,
      postcode: service.address.postcode
    },
    contacts: mapContacts(service),
    location: mapLocation(service),
    serviceDetails: mapNonCore.serviceDetails(service.nonCoreElements),
    generalNotes: mapNonCore.generalNotes(service.nonCoreElements),
    openingTimes: mapNonCore.openingTimes(service.nonCoreElements),
    venueType: mapNonCore.venueType(service.nonCoreElements)
  };
}

module.exports = mapService;
