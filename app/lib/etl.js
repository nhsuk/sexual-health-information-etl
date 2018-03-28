const moment = require('moment');
const requireEnv = require('require-environment-variables');

const config = require('./config');
const etlStore = require('etl-toolkit').etlStore;
const getAllIDs = require('./getAllIDs');
const dataUpdated = require('./dataUpdated');
const getService = require('./actions/getService');
const populateRecordsFromIdsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const utils = require('./utils');
const log = require('./logger');

requireEnv(['ETL_NAME']);

const RECORD_KEY = 'id';
const WORKERS = 1;
let resolvePromise;
let dataService;
let startMoment;
let lastRunDate;

etlStore.setIdKey(RECORD_KEY);

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${utils.getDuplicates(etlStore.getIds()).length} duplicate IDs`);
  log.info(`${etlStore.getErorredIds().length} errored records`);
}

async function etlComplete() {
  etlStore.saveRecords();
  etlStore.saveSummary();
  logStatus();
  if (etlStore.getRecords().length > 0) {
    await dataService.uploadData(startMoment);
    await dataService.uploadSummary(startMoment);
  }
  if (resolvePromise) {
    resolvePromise();
  }
}

function startRevisitFailuresQueue() {
  if (etlStore.getErorredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
      populateRecordAction: getService,
      queueComplete: etlComplete,
      workers: WORKERS,
    };
    populateRecordsFromIdsQueue.startRetryQueue(options);
  } else {
    etlComplete();
  }
}

function startPopulateRecordsFromIdsQueue() {
  const options = {
    populateRecordAction: getService,
    queueComplete: startRevisitFailuresQueue,
    workers: WORKERS,
  };
  populateRecordsFromIdsQueue.start(options);
}

async function loadLatestEtlData() {
  const { data, date } = await dataService.getLatestData();
  if (date) {
    lastRunDate = date;
    log.info(`Last ${utils.getMajorMinorVersion()} data uploaded on ${lastRunDate}`);
    data.map(etlStore.addRecord);
  }
}

async function etl(dataServiceIn) {
  dataService = dataServiceIn;
  startMoment = moment();
  clearState();
  lastRunDate = moment(config.initialLastRunDate);
  await loadLatestEtlData();

  if (await dataUpdated(lastRunDate)) {
    clearState();
    const pageIds = await getAllIDs();
    log.info(`Total ids: ${pageIds.length}`);
    etlStore.addIds(pageIds);
    pageIds.forEach(etlStore.deleteRecord);
    startPopulateRecordsFromIdsQueue();
  } else {
    log.info('No modified records, exiting');
    if (resolvePromise) {
      resolvePromise();
    }
  }
}

function start(dataServiceIn) {
  return new Promise((resolve, reject) => {
    etl(dataServiceIn).catch((ex) => {
      log.error(ex);
      reject(ex);
    });

    resolvePromise = () => {
      resolve();
    };
  });
}

module.exports = {
  start,
};
