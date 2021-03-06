function createLocation(coordinates) {
  return {
    coordinates: [
      Number(coordinates.longitude),
      Number(coordinates.latitude),
    ],
    type: 'Point',
  };
}

function locationValid(coordinates) {
  return coordinates && coordinates.latitude && coordinates.longitude;
}

function mapLocation(coordinates) {
  return locationValid(coordinates) ? createLocation(coordinates) : undefined;
}

module.exports = mapLocation;
