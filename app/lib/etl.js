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
  await dataService.uploadData();
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

async function smartEtl(dataServiceIn) {
  dataService = dataServiceIn;
  clearState();
  etlStore.setLastRunDate(moment('2018-02-20'));

  // eslint-disable-next-line no-await-in-loop
  const pageIds = await getModifiedIds(etlStore.getLastRunDate());
  etlStore.addIds(pageIds);
  log.info(`Total ids: ${pageIds.length}`);
  pageIds.forEach(etlStore.deleteRecord);
  startPopulateRecordsFromIdsQueue();
}

function start(dataServiceIn) {
  return new Promise((resolve, reject) => {
    try {
      smartEtl(dataServiceIn);
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
