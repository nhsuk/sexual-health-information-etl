function mapGsdId(rawService) {
  const link = rawService.feed.link.find(l => l.$.rel === 'alternate' && l.$.href);
  return link && link.$.href.split('=')[1];
}

module.exports = mapGsdId;
