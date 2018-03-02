const azureService = require('./azureService');
const config = require('./config');
const fsHelper = require('./fsHelper');
const log = require('./logger');
const moment = require('moment');
const utils = require('./utils');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const summaryFile = `${config.outputDir}/summary.json`;

async function getLatestDataBlob(version) {
  const filter = b => b.name.startsWith(`${utils.getFilePrefix()}${config.outputFile}-`) && b.name.endsWith(`${version}.json`);
  return azureService.getLatestBlob(filter);
}

async function getLatestData(version) {
  const lastScan = await getLatestDataBlob(version);
  if (lastScan) {
    log.info(`Latest data file '${lastScan.name}' identified`);
    await azureService.downloadFromAzure(outputFile, lastScan.name);
    log.info(`Latest data file '${lastScan.name}' downloaded`);
    const data = fsHelper.loadJsonSync(config.outputFile);
    const date = moment(lastScan.lastModified);
    return { data, date };
  }
  log.info(`unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getDatestamp() {
  return moment().format('YYYYMMDD');
}

function getSuffix() {
  return `-${getDatestamp()}-${utils.getMajorMinorVersion()}.json`;
}

async function uploadData() {
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${utils.getFilePrefix()}${config.outputFile}${getSuffix()}`);
  log.info('Saving summary file in Azure');
  await azureService.uploadToAzure(summaryFile, `${utils.getFilePrefix()}summary${getSuffix()}`);
}

module.exports = {
  getLatestData,
  uploadData
};
