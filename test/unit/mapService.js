const chai = require('chai');
const mapService = require('../../app/lib/mappers/mapService');
const rawService = require('../resources/rawService');

const expect = chai.expect;

describe('mapService', () => {
  it('should map raw service JSON to preferred structure', () => {
    const service = mapService(rawService);
    expect(service.name).to.equal('56 Dean Street Express');
    expect(service.type).to.equal('Sexual health information and support');
    expect(service.address).to.exist;
    expect(service.address.addressLines).to.exist;
    expect(service.address.addressLines.length).to.equal(4);
    expect(service.address.addressLines[0]).to.equal('56 Dean Street');
    expect(service.address.addressLines[1]).to.equal('Soho');
    expect(service.address.addressLines[2]).to.equal('London');
    expect(service.address.addressLines[3]).to.equal('Greater London');
    expect(service.address.postcode).to.equal('W1D 6AQ');
    expect(service.contacts).to.exist;
    expect(service.contacts.telephone).to.equal('020 3315 6699');
    expect(service.contacts.website).to.equal('http://www.56deanstreet.nhs.uk/');
    expect(service.location).to.exist;
    expect(service.location.type).to.equal('Point');
    expect(service.location.coordinates).to.exist;
    expect(service.location.coordinates[0]).to.equal(-0.132011265);
    expect(service.location.coordinates[1]).to.equal(51.51251);
    expect(service.serviceDetails).to.equal('Some service details text');
    expect(service.generalNotes).to.equal('Some general notes');
    expect(service.openingTimes).to.equal('Monday to Friday 3:30 - 4.30pm (walk-in)');
    expect(service.venueType).to.equal('Clinic');
  });
});
