const moment = require('moment');
const etlStore = require('./etl-toolkit/etlStore');
const getModifiedIds = require('./actions/getModifiedIds');
const getService = require('./actions/getService');
const populateRecordsFromIdsQueue = require('./etl-toolkit/queues/populateRecordsFromIds');
const utils = require('./utils');
const log = require('./logger');

const RECORD_KEY = 'id';
const WORKERS = 1;
let resolvePromise;
let dataService;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${utils.getDuplicates(etlStore.getIds()).length} duplicate ID`);
  log.info(`${etlStore.getFailedIds().length} errored records`);
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  logStatus();
  if (etlStore.getRecords().length > 0) {
    await dataService.uploadData();
  }
  if (resolvePromise) {
    resolvePromise();
  }
}
function startPopulateRecordsFromIdsQueue() {
  const options = {
    workers: WORKERS,
    queueComplete: etlComplete,
    populateRecordAction: getService
  };
  populateRecordsFromIdsQueue.start(options);
}

async function loadLatestEtlData() {
  const { data, date } = await dataService.getLatestData(utils.getMajorMinorVersion());
  if (date) {
    etlStore.setLastRunDate(date);
    log.info(`Last ${utils.getMajorMinorVersion()} data uploaded on ${etlStore.getLastRunDate()}`);
    data.map(etlStore.addRecord);
  }
}

async function etl(dataServiceIn) {
  dataService = dataServiceIn;
  clearState();
  // set initial date to last known run date
  etlStore.setLastRunDate(moment('2018-02-20'));
  await loadLatestEtlData();

  // only one page of results despite there being over 800 records
  const pageIds = await getModifiedIds(etlStore.getLastRunDate(), 1);
  log.info(`Total ids: ${pageIds.length}`);
  if (pageIds.length === 0) {
    log.info('No modified records, exiting');
    if (resolvePromise) {
      resolvePromise();
    }
  } else {
    etlStore.addIds(pageIds);
    pageIds.forEach(etlStore.deleteRecord);
    startPopulateRecordsFromIdsQueue();
  }
}

function start(dataServiceIn) {
  return new Promise((resolve, reject) => {
    try {
      etl(dataServiceIn);
    } catch (ex) {
      log.error(ex);
      reject(ex);
    }
    resolvePromise = () => {
      resolve();
    };
  });
}

module.exports = {
  start,
};
