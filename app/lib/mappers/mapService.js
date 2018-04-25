const utils = require('../utils');
const mapLocation = require('./mapLocation');
const mapNonCoreElements = require('./mapNonCoreElements');
const mapContacts = require('./mapContacts');
const mapGsdId = require('./mapGsdId');

function mapService(rawService) {
  const entry = rawService.feed.entry;
  const service = entry.content.service;
  return {
    address: {
      addressLines: service.address.addressLine,
      postcode: service.address.postcode,
    },
    contacts: mapContacts(service),
    generalNotes: mapNonCoreElements(service.nonCoreElements, 'General notes'),
    gsdId: mapGsdId(rawService),
    id: utils.getId(entry.id),
    location: mapLocation(service),
    name: service.name._,
    openingTimes: {
      description: mapNonCoreElements(service.nonCoreElements, 'Opening times'),
    },
    serviceDetails: mapNonCoreElements(service.nonCoreElements, 'Service details'),
    serviceType: service.type._,
    venueType: mapNonCoreElements(service.nonCoreElements, 'Venue Type'),
  };
}

module.exports = mapService;
