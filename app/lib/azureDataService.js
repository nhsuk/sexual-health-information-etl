const azureService = require('./azureService');
const config = require('./config');
const fsHelper = require('./fsHelper');
const log = require('./logger');
const utils = require('./utils');
const createFilter = require('./createFileVersionFilter');
const sortDateDesc = require('./sortByFilenameDateDesc');
const getDateFromFilename = require('./getDateFromFilename');

const outputFile = `${config.outputDir}/${config.outputFile}.json`;
const summaryFile = `${config.outputDir}/summary.json`;

async function getLatestDataBlob(version) {
  return azureService.getLatestBlob(createFilter(config.outputFile, version), sortDateDesc);
}

async function getLatestData(version) {
  const lastScan = await getLatestDataBlob(version);
  if (lastScan) {
    log.info(`Latest data file '${lastScan.name}' identified`);
    await azureService.downloadFromAzure(outputFile, lastScan.name);
    log.info(`Latest data file '${lastScan.name}' downloaded`);
    const data = fsHelper.loadJsonSync(config.outputFile);
    const date = getDateFromFilename(lastScan.name);
    return { data, date };
  }
  log.info(`unable to retrieve data, no data available for release ${version}?`);
  return { data: [] };
}

function getSuffix(startMoment) {
  return `-${startMoment.format('YYYYMMDD')}-${utils.getMajorMinorVersion()}.json`;
}

async function uploadData(startMoment) {
  log.info(`Overwriting '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${config.outputFile}.json`);
  log.info(`Saving date stamped version of '${config.outputFile}' in Azure`);
  await azureService.uploadToAzure(outputFile, `${config.outputFile}${getSuffix(startMoment)}`);
  log.info('Saving summary file in Azure');
  await azureService.uploadToAzure(summaryFile, `${config.outputFile}-summary${getSuffix(startMoment)}`);
}

module.exports = {
  getLatestData,
  uploadData
};
