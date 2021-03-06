const chai = require('chai');
const fs = require('fs');
const moment = require('moment');
const nock = require('nock');

const expect = chai.expect;

const etl = require('../../app/lib/etl');
const etlStore = require('etl-toolkit').etlStore;
const config = require('../../app/lib/config');

function mockDataService(data, date, expectUpload) {
  return {
    getLatestData: () => new Promise(resolve => resolve({ data, date })),
    uploadData: () => new Promise((resolve, reject) => (expectUpload ? resolve(true) : reject(new Error('Upload data should not have been called')))),
    uploadSummary: () => new Promise((resolve, reject) => (expectUpload ? resolve(true) : reject(new Error('Upload summary should not have been called')))),
  };
}

function readFile(path) {
  return fs.readFileSync(path, 'utf8');
}

function stubResults(date) {
  const stubbedModifiedData = readFile('test/resources/modified-records.xml');
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(200, stubbedModifiedData);

  const stubbedAllData = readFile('test/resources/all-records.xml');
  const allUrl = `/all.xml?apikey=${process.env.SYNDICATION_API_KEY}`;
  nock(config.syndicationApiUrl)
    .get(allUrl)
    .reply(200, stubbedAllData);
}

function stubNoResults(date) {
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(404, 'Error: Failed to load page, status code: 404');
}

function stubResultsError(date) {
  const url = `/modifiedsince/${date.year()}/${date.month() + 1}/${date.date()}.xml?apikey=${process.env.SYNDICATION_API_KEY}&page=1`;
  nock(config.syndicationApiUrl)
    .get(url)
    .reply(500, 'Error: syndication is down');
}

function stubServiceLookup(filePath, id) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(`/${id}.xml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(200, stubbedData);
}

function stubServiceError(id) {
  nock(config.syndicationApiUrl)
    .get(`/${id}.xml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(500, '500 error');
}

function stubServiceErrorThenLookup(filePath, id) {
  const stubbedData = readFile(filePath);
  nock(config.syndicationApiUrl)
    .get(`/${id}.xml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(500, '500 error')
    .get(`/${id}.xml?apikey=${process.env.SYNDICATION_API_KEY}`)
    .reply(200, stubbedData);
}

beforeEach(() => {
  etlStore.clearState();
});

function stubModifiedRecords(date) {
  stubResults(date);
}

describe('ETL', function test() {
  this.timeout(5000);

  it('should update all if no previous data available', async () => {
    const lastModifiedDate = moment(config.initialLastRunDate);
    const ids = ['19708356', '19690074'];
    const data = [];
    const dataDate = undefined;
    const dataService = mockDataService(data, dataDate, true);

    stubModifiedRecords(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceLookup('test/resources/service-two.xml', ids[1]);

    await etl.start(dataService);
    expect(etlStore.getRecords().length).to.equal(2);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getRecord(ids[1]).name).to.equal('Two');
  });

  it('should only update if changed record', async () => {
    const lastModifiedDate = moment('20180220', 'YYYYMMDD');
    const ids = ['19708356', '19690074'];
    const data = [
      { id: ids[0], name: 'One' },
      { id: ids[1], name: 'Two' },
    ];
    const dataService = mockDataService(data, lastModifiedDate, true);
    stubModifiedRecords(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceLookup('test/resources/service-two.xml', ids[1]);

    await etl.start(dataService);
    expect(etlStore.getRecords().length).to.equal(2);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getRecord(ids[1]).name).to.equal('Two');
  });

  it('should clear down old data before run', async () => {
    const lastModifiedDate = moment('20180220', 'YYYYMMDD');
    const ids = ['19708356', '19690074'];
    const data = [
      { id: 'not', name: 'old' },
      { id: 'present', name: 'data' },
    ];
    const dataService = mockDataService(data, lastModifiedDate, true);
    stubModifiedRecords(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceLookup('test/resources/service-two.xml', ids[1]);

    await etl.start(dataService);
    expect(etlStore.getRecords().length).to.equal(2);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getRecord(ids[1]).name).to.equal('Two');
  });

  it('should track errored records', async () => {
    const lastModifiedDate = moment('20180220', 'YYYYMMDD');
    const ids = ['19708356', '19690074'];
    const data = [
      { id: ids[0], name: 'One' },
      { id: ids[1], name: 'Two' },
    ];
    const dataService = mockDataService(data, lastModifiedDate, true);
    stubModifiedRecords(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceError(ids[1]);

    await etl.start(dataService);
    expect(etlStore.getRecords().length).to.equal(1);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getErorredIds().length).to.equal(1);
    expect(etlStore.getErorredIds()[0]).to.equal(ids[1]);
  });

  it('should retry errored records', async () => {
    const lastModifiedDate = moment('20180220', 'YYYYMMDD');
    const ids = ['19708356', '19690074'];
    const data = [
      { id: ids[0], name: 'One' },
      { id: ids[1], name: 'Two' },
    ];
    const dataService = mockDataService(data, lastModifiedDate, true);
    stubModifiedRecords(lastModifiedDate);
    stubServiceLookup('test/resources/service-one.xml', ids[0]);
    stubServiceErrorThenLookup('test/resources/service-two.xml', ids[1]);

    await etl.start(dataService);
    expect(etlStore.getRecords().length).to.equal(2);
    expect(etlStore.getRecord(ids[0]).name).to.equal('One');
    expect(etlStore.getRecord(ids[1]).name).to.equal('Two');
    expect(etlStore.getErorredIds().length).to.equal(0);
  });

  it('should take no action if no modified records', async () => {
    const lastModifiedDate = moment('20180222', 'YYYYMMDD');
    const data = [];
    stubNoResults(lastModifiedDate);
    await etl.start(mockDataService(data, lastModifiedDate, false));
    expect(etlStore.getRecords().length).to.equal(0);
  });

  it('should throw exception if syndication is down', async () => {
    const lastModifiedDate = moment('20180220', 'YYYYMMDD');
    const data = [];
    stubResultsError(lastModifiedDate);
    try {
      await etl.start(mockDataService(data, lastModifiedDate, false));
      chai.assert.fail('should have thrown exception');
    } catch (ex) {
      expect(ex.message).to.equal('500 - "Error: syndication is down"');
    }
  });

  afterEach(() => {
    nock.cleanAll();
  });
});
