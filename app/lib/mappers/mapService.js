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
    serviceDetails: mapNonCore.getServiceDetails(service.nonCoreElements),
    generalNotes: mapNonCore.getGeneralNotes(service.nonCoreElements),
    openingTimes: mapNonCore.getOpeningTimes(service.nonCoreElements),
    venueType: mapNonCore.getVenueType(service.nonCoreElements)
  };
}

module.exports = mapService;
