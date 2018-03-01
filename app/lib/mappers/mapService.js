function mapService(rawService) {
  const entry = rawService.feed.entry;
  const service = entry.content.service;
  return {
    id: entry.id.split('/').pop(),
    name: service.name._,
    type: service.type._,
    webAddress: service.WebAddress,
    address: service.address,
    contact: service.contact,
    location: {
      type: 'Point',
      coordinates: {
        longitude: service.longitude,
        latitude: service.latitude
      }
    }
  };
}

module.exports = mapService;
