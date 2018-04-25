const Entities = require('html-entities').AllHtmlEntities;
const utils = require('../utils');

const entities = new Entities();
const htmlQuoteRegex = /&quot;/g;

function tidyHtmlEntities(elementText) {
  return entities.decode(elementText.replace(htmlQuoteRegex, '')).trim();
}

function getElements(nonCoreElements) {
  return nonCoreElements && nonCoreElements.nonCoreElement ?
    utils.asArray(nonCoreElements.nonCoreElement) : [];
}

function mapNonCoreElements(nonCoreElements, title) {
  const element = getElements(nonCoreElements).find(el => el.elementTitle === title);
  return element ? element.elementText && tidyHtmlEntities(element.elementText) : undefined;
}

module.exports = mapNonCoreElements;
