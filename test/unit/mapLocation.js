const chai = require('chai');
const mapLocation = require('../../app/lib/mappers/mapLocation');

const expect = chai.expect;

describe('mapLocation', () => {
  it('should map coordinates to geoJSON', () => {
    const coordinates = {
      latitude: '51.51251',
      longitude: '-0.132011265',
    };
    const location = mapLocation(coordinates);
    expect(location).to.exist;
    expect(location.type).to.equal('Point');
    expect(location.coordinates).to.exist;
    expect(location.coordinates[0]).to.equal(-0.132011265);
    expect(location.coordinates[1]).to.equal(51.51251);
  });

  it('should gracefully handle mising lat long', () => {
    const coordinates = {};
    const location = mapLocation(coordinates);
    expect(location).to.be.undefined;
  });
});
