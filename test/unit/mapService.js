const chai = require('chai');
const mapService = require('../../app/lib/mappers/mapService');
const rawService = require('../resources/rawService');

const expect = chai.expect;

describe('mapService', () => {
  it('should map raw service JSON to preferred structure', () => {
    const service = mapService(rawService);
    expect(service.id).to.equal('19708356');
    expect(service.gsdId).to.equal('8972333');
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
    // location logic fully tested in mapLocation unit test
    expect(service.location).to.exist;
    expect(service.serviceDetails).to.equal('Some service details text');
    expect(service.generalNotes).to.equal('Some general notes');
    expect(service.openingTimes).to.equal('Monday to Friday 3:30 - 4.30pm (walk-in)');
    expect(service.venueType).to.equal('Clinic');
  });
});
