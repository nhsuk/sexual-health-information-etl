const utils = require('../utils');

function getElements(nonCoreElements) {
  return nonCoreElements && nonCoreElements.nonCoreElement ?
    utils.asArray(nonCoreElements.nonCoreElement) : [];
}

function getElement(nonCoreElements, title) {
  const serviceDetails = getElements(nonCoreElements).find(el => el.elementTitle === title);
  return serviceDetails ? serviceDetails.elementText : undefined;
}

function getServiceDetails(nonCoreElements) {
  return getElement(nonCoreElements, 'Service details');
}

function getGeneralNotes(nonCoreElements) {
  return getElement(nonCoreElements, 'General notes');
}

function getOpeningTimes(nonCoreElements) {
  return getElement(nonCoreElements, 'Opening times');
}

function getVenueType(nonCoreElements) {
  return getElement(nonCoreElements, 'Venue Type');
}

module.exports = {
  getGeneralNotes,
  getOpeningTimes,
  getServiceDetails,
  getVenueType
};
