const utils = require('../utils');
const mapLocation = require('./mapLocation');
const mapNonCore = require('./mapNonCoreElements');
const mapContacts = require('./mapContacts');

function mapService(rawService) {
  const entry = rawService.feed.entry;
  const service = entry.content.service;
  return {
    address: {
      addressLines: service.address.addressLine,
      postcode: service.address.postcode,
    },
    contacts: mapContacts(service),
    generalNotes: mapNonCore.generalNotes(service.nonCoreElements),
    id: utils.getId(entry.id),
    location: mapLocation(service),
    name: service.name._,
    openingTimes: mapNonCore.openingTimes(service.nonCoreElements),
    serviceDetails: mapNonCore.serviceDetails(service.nonCoreElements),
    type: service.type._,
    venueType: mapNonCore.venueType(service.nonCoreElements),
  };
}

module.exports = mapService;
