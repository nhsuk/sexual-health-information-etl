const chai = require('chai');
const mapIds = require('../../app/lib/mappers/mapIds');
const config = require('../../app/lib/config');

const expect = chai.expect;

describe('mapIds', () => {
  it('should map number from entry ID URL to IDs', () => {
    const results = {
      feed: {
        entry: [
          { id: 'http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport/19708356' },
          { id: 'http://v1.syndication.nhschoices.nhs.uk/services/types/sexualhealthinformationandsupport/19690074' }]
      }
    };

    const ids = mapIds(results);
    expect(ids.length).to.equal(2);
    expect(ids[0]).to.equal(`${config.outputFile}-19708356`);
    expect(ids[1]).to.equal(`${config.outputFile}-19690074`);
  });

  it('should gracefully handle missing entries', () => {
    const results = { feed: {} };

    const ids = mapIds(results);
    expect(ids.length).to.equal(0);
  });
});
