const chai = require('chai');

const populateRecordsFromIds = require('../../app/lib/etl-toolkit/queues/populateRecordsFromIds');
const etlStore = require('../../app/lib/etl-toolkit/etlStore');

const expect = chai.expect;

const serviceId1 = 'FP1';
const serviceId2 = 'FP2';
const serviceId3 = 'FP3';

function getServiceAction(serviceId) {
  return new Promise((resolve) => {
    resolve({ id: serviceId });
  });
}

function getServiceWithErrorAction(serviceId) {
  return new Promise((resolve) => {
    if (serviceId === serviceId2) {
      throw new Error('error in json');
    } else {
      resolve({ id: serviceId });
    }
  });
}

describe('Populate Records from IDs queue', () => {
  beforeEach(() => {
    etlStore.clearState();
  });

  it('should populate etlStore with records', (done) => {
    etlStore.addIds([serviceId1, serviceId2, serviceId3]);
    const options = {
      workers: 1,
      populateRecordAction: getServiceAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(serviceId1).id).to.equal(serviceId1);
        expect(etlStore.getRecord(serviceId2).id).to.equal(serviceId2);
        expect(etlStore.getRecord(serviceId3).id).to.equal(serviceId3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        expect(etlStore.getRecords().length).to.equal(3);
        /* eslint-enable no-underscore-dangle */
        done();
      },
    };
    populateRecordsFromIds.start(options);
  });

  it('should call queueComplete for empty ID list', (done) => {
    etlStore.addIds([]);
    const options = {
      workers: 1,
      populateRecordAction: getServiceAction,
      queueComplete: () => {
        done();
      },
    };
    populateRecordsFromIds.start(options);
  });

  it('should skip duplicate IDs', (done) => {
    etlStore.addIds([serviceId1, serviceId2, serviceId3, serviceId1]);
    const options = {
      workers: 1,
      populateRecordAction: getServiceAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(serviceId1).id).to.equal(serviceId1);
        expect(etlStore.getRecord(serviceId2).id).to.equal(serviceId2);
        expect(etlStore.getRecord(serviceId3).id).to.equal(serviceId3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        expect(etlStore.getRecords().length).to.equal(3);
        /* eslint-enable no-underscore-dangle */
        done();
      },
    };
    populateRecordsFromIds.start(options);
  });

  it('should add failed IDs to list', (done) => {
    etlStore.addIds([serviceId1, serviceId2, serviceId3]);
    const options = {
      workers: 1,
      populateRecordAction: getServiceWithErrorAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(serviceId1).id).to.equal(serviceId1);
        expect(etlStore.getRecord(serviceId3).id).to.equal(serviceId3);
        expect(etlStore.getRecords().length).to.equal(2);
        expect(etlStore.getErorredIds().length).to.equal(1);
        /* eslint-enable no-underscore-dangle */
        done();
      },
    };
    populateRecordsFromIds.start(options);
  });

  it('starting retry queue should retry failed IDs and remove from the list if successful', (done) => {
    etlStore.addIds([serviceId1, serviceId2, serviceId3]);

    const retryOptions = {
      workers: 1,
      populateRecordAction: getServiceAction,
      queueComplete: () => {
        /* eslint-disable no-underscore-dangle */
        expect(etlStore.getRecord(serviceId1).id).to.equal(serviceId1);
        expect(etlStore.getRecord(serviceId3).id).to.equal(serviceId3);
        expect(etlStore.getRecords().length).to.equal(3);
        expect(etlStore.getErorredIds().length).to.equal(0);
        /* eslint-enable no-underscore-dangle */
        done();
      },
    };

    const options = {
      workers: 1,
      populateRecordAction: getServiceWithErrorAction,
      queueComplete: () => {
        expect(etlStore.getRecords().length).to.equal(2);
        expect(etlStore.getErorredIds().length).to.equal(1);
        populateRecordsFromIds.startRetryQueue(retryOptions);
      },
    };
    populateRecordsFromIds.start(options);
  });
});
