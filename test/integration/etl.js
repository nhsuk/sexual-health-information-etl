const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
const nock = require('nock');

const expect = chai.expect;

const etl = require('../../app/lib/etl');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');
const config = require('../../app/lib/config');

function mockDataService(ids, data, idsDate, dataDate, uploadCalled) {
  return {
    getLatestIds: () => new Promise(resolve => resolve({ ids, date: idsDate })),
    getLatestData: () => new Promise(resolve => resolve({ data, date: dataDate })),
    uploadData: () => new Promise((resolve, reject) => (uploadCalled ? resolve(true) : reject(new Error('should not have been called')))),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubResults(filePath, date) {
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(url)
    .times(2)
    .reply(200, stubbedData);
}

function stubServiceLookup(filePath, odsCode) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(`/${odsCode}.xml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(200, stubbedData);
}

beforeEach(() => {
  etlStore.clearState();
});

function stubModifiedRecords(date) {
  stubResults('test/resources/modified-records.xml', date);
}

function stubNoModifiedRecords(date) {
  stubResults('test/resources/no-modified-records.xml', date);
}

describe('ETL', function test() {
  this.timeout(5000);
  it('should only update if changed record', async () => {
    const idsDate = moment('20180220', 'YYYYMMDD');
    const dataDate = idsDate;
    stubModifiedRecords(idsDate);
    const ids = ['19708356', '19690074'];
    const data = [
      { id: ids[0], name: 'One' },
      { id: ids[1], name: 'Two' },
    ];
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceLookup('test/resources/service-two.xml', ids[1]);

    await etl.start(mockDataService(ids, data, idsDate, dataDate, true));
    expect(etlStore.getRecords().length).to.equal(2);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getRecord(ids[1]).name).to.equal('Two');
  });

  it('should take no action if no modified records', async () => {
    const idsDate = moment('20180220', 'YYYYMMDD');
    const dataDate = idsDate;
    stubNoModifiedRecords(idsDate);
    const data = [];
    const ids = [];
    await etl.start(mockDataService(ids, data, idsDate, dataDate, false));
    expect(etlStore.getRecords().length).to.equal(0);
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
