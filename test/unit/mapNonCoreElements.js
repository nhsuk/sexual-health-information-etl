const chai = require('chai');
const mapNonCoreElements = require('../../app/lib/mappers/mapNonCoreElements');

const expect = chai.expect;

describe('mapNonCoreElements', () => {
  it('should return the text based on the title', () => {
    const elementTitle = 'Element title';
    const elementText = 'The service details text';
    const nonCoreElements = {
      nonCoreElement: [{ elementText, elementTitle }],
    };
    const result = mapNonCoreElements(nonCoreElements, elementTitle);
    expect(result).to.equal(elementText);
  });

  it('should trim leading and trailing spaces', () => {
    const elementTitle = 'Element title';
    const elementText = '  text padded with spaces  ';
    const nonCoreElements = {
      nonCoreElement: [{ elementText, elementTitle }],
    };
    const result = mapNonCoreElements(nonCoreElements, elementTitle);
    expect(result).to.equal('text padded with spaces');
  });

  it('should remove \'&quot;\' chars', () => {
    const elementTitle = 'Element title';
    const elementText = '&quot;text&quot; &quot;with&quot; &quot;quote&quot; &quot;chars&quot;';
    const nonCoreElements = {
      nonCoreElement: [{ elementText, elementTitle }],
    };
    const result = mapNonCoreElements(nonCoreElements, elementTitle);
    expect(result).to.equal('text with quote chars');
  });

  it('should decode \'&apos;\' and \'&amp;\' chars', () => {
    const elementTitle = 'Element title';
    const elementText = '&apos;apos chars&apos; and &amp;amp chars&amp;';
    const nonCoreElements = {
      nonCoreElement: [{ elementText, elementTitle }],
    };
    const result = mapNonCoreElements(nonCoreElements, elementTitle);
    expect(result).to.equal('\'apos chars\' and &amp chars&');
  });

  it('should gracefully handle missing elements', () => {
    const nonCoreElements = {
    };
    const result = mapNonCoreElements(nonCoreElements, '');
    expect(result).to.be.undefined;
  });

  it('should gracefully handle missing element text', () => {
    const elementTitle = 'Element title';
    const nonCoreElements = {
      nonCoreElement: [{ elementTitle }],
    };
    const result = mapNonCoreElements(nonCoreElements, elementTitle);
    expect(result).to.be.undefined;
  });
});
