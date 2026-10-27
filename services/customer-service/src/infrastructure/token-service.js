const jwt = require('jsonwebtoken');
const config = require('../config');

function verify(token) {
  return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
}

module.exports = { verify };