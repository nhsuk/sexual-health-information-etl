function createLocation(coordinates) {
  return {
    type: 'Point',
    coordinates: [
      Number(coordinates.longitude),
      Number(coordinates.latitude),
    ],
  };
}

function locationValid(coordinates) {
  return coordinates && coordinates.latitude && coordinates.longitude;
}

function mapLocation(coordinates) {
  return locationValid(coordinates) ? createLocation(coordinates) : undefined;
}

module.exports = mapLocation;
