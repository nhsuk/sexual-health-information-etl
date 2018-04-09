const chai = require('chai');
const mapGsdId = require('../../app/lib/mappers/mapGsdId');
const rawService = require('../resources/rawService');
const rawServiceNoAltLink = require('../resources/rawService-no-alt-link');
const rawServiceUnsupportedUrlFormat = require('../resources/rawService-unsupported-alt-link-format');

const expect = chai.expect;

describe('mapGsdId', () => {
  it('should map GsdId from alternate link href', () => {
    const gsdId = mapGsdId(rawService);
    expect(gsdId).to.equal('8972333');
  });

  it('should gracefully handle missing alternate link href', () => {
    const gsdId = mapGsdId(rawServiceNoAltLink);
    expect(gsdId).to.be.undefined;
  });

  it('should gracefully handle unexpected format of alternate link href', () => {
    const gsdId = mapGsdId(rawServiceUnsupportedUrlFormat);
    expect(gsdId).to.be.undefined;
  });
});
