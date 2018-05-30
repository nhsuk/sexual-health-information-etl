const moment = require('moment');

const config = require('./config');
const dataUpdated = require('./dataUpdated');
const EtlStore = require('etl-toolkit').EtlStore;
const getAllIDs = require('./getAllIDs');
const getService = require('./actions/getService');
const log = require('./logger');
const PopulateRecordsQueue = require('etl-toolkit').queues.populateRecordsFromIds;
const utils = require('./utils');

const WORKERS = 1;
let resolvePromise;
let dataService;
let startMoment;
let lastRunDate;

const etlStore = new EtlStore({ idKey: config.idKey, log, outputFile: config.outputFile });

const populateRecordsFromIdsQueue = new PopulateRecordsQueue({
  etlStore,
  hitsPerHour: config.hitsPerHour,
  log,
  populateRecordAction: getService,
});

function clearState() {
  etlStore.clearState();
}

function logStatus() {
  log.info(`${utils.getDuplicates(etlStore.getIds()).length} duplicate IDs`);
  log.info(`${etlStore.getErroredIds().length} errored records`);
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
  if (etlStore.getErroredIds().length > 0) {
    log.info('Revisiting failed IDs');
    const options = {
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
    data.map(record => etlStore.addRecord(record));
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
    pageIds.forEach(id => etlStore.deleteRecord(id));
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
  etlStore,
  start,
};
