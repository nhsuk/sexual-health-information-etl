const version = require('../../package').version;

const config = {
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  etlName: process.env.ETL_NAME,
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  idListFile: 'ids',
  initialLastRunDate: process.env.INITIAL_LAST_RUN_DATE || '2018-01-22',
  outputDir: './output',
  outputFile: process.env.OUTPUT_FILE || 'shis-data',
  saveEvery: 100,
  syndicationApiUrl: process.env.SYNDICATION_SERVICE_END_POINT || 'http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport',
  version,
};

module.exports = config;
