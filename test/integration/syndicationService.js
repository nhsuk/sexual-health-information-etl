const chai = require('chai');
const moment = require('moment');

const service = require('../../app/lib/syndicationService');

const expect = chai.expect;

describe('Syndication Service', () => {
  it('should retrieve modified since page', async function test() {
    this.timeout(5000);
    const page = await service.getModifiedSincePage(moment('2018-01-25'), 1);
    expect(page).to.exist;
  });
});
