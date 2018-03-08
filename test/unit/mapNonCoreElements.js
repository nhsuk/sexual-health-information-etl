const chai = require('chai');
const mapNonCoreElements = require('../../app/lib/mappers/mapNonCoreElements');

const expect = chai.expect;

describe('mapNonCoreElements', () => {
  it('should map service details', () => {
    const elementTitle = 'Service details';
    const elementText = 'The service details text';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle, elementText }]
    };
    const result = mapNonCoreElements.serviceDetails(nonCoreElements);
    expect(result).to.equal(elementText);
  });

  it('should map general notes', () => {
    const elementTitle = 'General notes';
    const elementText = 'The general notes text';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle, elementText }]
    };
    const result = mapNonCoreElements.generalNotes(nonCoreElements);
    expect(result).to.equal(elementText);
  });

  it('should map opening times', () => {
    const elementTitle = 'Opening times';
    const elementText = 'The opening times text';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle, elementText }]
    };
    const result = mapNonCoreElements.openingTimes(nonCoreElements);
    expect(result).to.equal(elementText);
  });

  it('should map venue type', () => {
    const elementTitle = 'Venue Type';
    const elementText = 'Clinic';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle, elementText }]
    };
    const result = mapNonCoreElements.venueType(nonCoreElements);
    expect(result).to.equal(elementText);
  });

  it('should trim leading and trailing spaces', () => {
    const elementTitle = 'Opening times';
    const elementText = '  text padded with spaces  ';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle, elementText }]
    };
    const result = mapNonCoreElements.openingTimes(nonCoreElements);
    expect(result).to.equal('text padded with spaces');
  });

  it('should gracefully handle missing elements', () => {
    const nonCoreElements = {
    };
    const result = mapNonCoreElements.serviceDetails(nonCoreElements);
    expect(result).to.be.undefined;
  });

  it('should gracefully handle missing element text', () => {
    const elementTitle = 'Opening times';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle }]
    };
    const result = mapNonCoreElements.openingTimes(nonCoreElements);
    expect(result).to.be.undefined;
  });
});
