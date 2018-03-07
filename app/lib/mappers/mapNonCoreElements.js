const utils = require('../utils');

function getElements(nonCoreElements) {
  return nonCoreElements && nonCoreElements.nonCoreElement ?
    utils.asArray(nonCoreElements.nonCoreElement) : [];
}

function getElement(nonCoreElements, title) {
  const element = getElements(nonCoreElements).find(el => el.elementTitle === title);
  return element ? element.elementText : undefined;
}

function serviceDetails(nonCoreElements) {
  return getElement(nonCoreElements, 'Service details');
}

function generalNotes(nonCoreElements) {
  return getElement(nonCoreElements, 'General notes');
}

function openingTimes(nonCoreElements) {
  return getElement(nonCoreElements, 'Opening times');
}

function venueType(nonCoreElements) {
  return getElement(nonCoreElements, 'Venue Type');
}

module.exports = {
  generalNotes,
  openingTimes,
  serviceDetails,
  venueType
};
