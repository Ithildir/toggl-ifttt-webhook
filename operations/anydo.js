const Api = require('anydo-api');

const { ANYDO_EMAIL, ANYDO_PASSWORD } = process.env;

const api = new Api(ANYDO_EMAIL, ANYDO_PASSWORD);

module.exports = api;
