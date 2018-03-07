const version = require('../../package').version;

const config = {
  version,
  hitsPerHour: process.env.HITS_PER_HOUR || 20000,
  saveEvery: 100,
  outputDir: './output',
  outputFile: process.env.OUTPUT_FILE || 'shis-data',
  idListFile: 'ids',
  containerName: process.env.CONTAINER_NAME || 'etl-output',
  syndicationApiUrl: process.env.SYNDICATION_SERVICE_END_POINT || 'http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport',
};

module.exports = config;
