const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
const nock = require('nock');

const config = require('../../app/lib/config');
const service = require('../../app/lib/syndicationService');

const expect = chai.expect;

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubResults(filePath, date) {
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(200, stubbedData);
}

describe('Syndication Service', () => {
  it('should retrieve modified since page', async () => {
    const lastModifiedDate = moment('20180125', 'YYYYMMDD');
    stubResults('test/resources/modified-records.xml', lastModifiedDate);
    const page = await service.getModifiedSincePage(moment('2018-01-25'), 1);
    expect(page).to.exist;
  });

  it('should throw error if syndication returns html', async () => {
    const lastModifiedDate = moment('20180125', 'YYYYMMDD');
    stubResults('test/resources/error.html', lastModifiedDate);
    try {
      await service.getModifiedSincePage(moment('2018-01-25'), 1);
      chai.assert.fail('should have thrown exception');
    } catch (ex) {
      expect(ex).to.exist;
    }
  });
});
