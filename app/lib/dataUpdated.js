const service = require('./syndicationService');

async function dataUpdated(moment) {
  try {
    await service.getModifiedSincePage(moment, 1);
    return true;
  } catch (ex) {
    // sometimes sydication returns an html page with status 200 and 404 message text
    if (ex.statusCode === 404 || ex.message.includes(' 404')) {
      return false;
    }
    throw ex;
  }
}

module.exports = dataUpdated;
