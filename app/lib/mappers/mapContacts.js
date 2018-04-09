const phoneNumberParser = require('../phoneNumberParser');

function mapContacts(service) {
  return {
    telephoneNumber: phoneNumberParser(service.contact.telephone),
    website: service.WebAddress,
  };
}

module.exports = mapContacts;
