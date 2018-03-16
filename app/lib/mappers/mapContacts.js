const phoneNumberParser = require('../phoneNumberParser');

function mapContacts(service) {
  return {
    telephone: phoneNumberParser(service.contact.telephone),
    website: service.WebAddress,
  };
}

module.exports = mapContacts;
