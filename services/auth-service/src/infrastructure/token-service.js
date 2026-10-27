const jwt = require('jsonwebtoken');
const config = require('../config');

function sign({ uid, role }) {
  return jwt.sign({ role }, config.jwt.secret, {
    subject: String(uid),
    expiresIn: config.jwt.expiresInSec,
    algorithm: 'HS256',
  });
}

function verify(token) {
  return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
}

module.exports = { sign, verify };