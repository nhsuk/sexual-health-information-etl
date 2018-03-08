const service = require('./syndicationService');

async function dataUpdated(moment) {
  try {
    // ideally this would request the page via a 'HEAD' call
    // but this did not give consistent status codes from Syndication
    await service.getModifiedSincePage(moment, 1);
    return true;
  } catch (ex) {
    if (ex.statusCode === 404) {
      return false;
    }
    throw ex;
  }
}

module.exports = dataUpdated;
