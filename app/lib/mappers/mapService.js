const utils = require('../utils');
const nonCore = require('./mapNonCoreElements');

function createLocation(coordinates) {
  return {
    type: 'Point',
    coordinates: [
      Number(coordinates.longitude),
      Number(coordinates.latitude),
    ],
  };
}

function locationValid(coordinates) {
  return coordinates && coordinates.latitude && coordinates.longitude;
}

function mapLocation(coordinates) {
  return locationValid(coordinates) ? createLocation(coordinates) : undefined;
}

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
    contacts: {
      telephone: service.contact.telephone,
      website: service.WebAddress
    },
    location: mapLocation(service),
    serviceDetails: nonCore.getServiceDetails(service.nonCoreElements),
    generalNotes: nonCore.getGeneralNotes(service.nonCoreElements),
    openingTimes: nonCore.getOpeningTimes(service.nonCoreElements),
    venueType: nonCore.getVenueType(service.nonCoreElements)
  };
}

module.exports = mapService;
