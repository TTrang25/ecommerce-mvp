const { parseUid } = require('../domain/validation');
const { NotFoundError } = require('../domain/errors');
const { canAccess } = require('./access-policy');

module.exports = ({ customerRepository }) =>
  async function getCustomer({ requester, rawUid }) {
    const uid = parseUid(rawUid);
    // Trả 404 (không phải 403) cho hồ sơ của người khác: không tiết lộ uid nào tồn tại
    if (!canAccess(requester, uid)) throw new NotFoundError('Customer not found');

    const customer = await customerRepository.findByUid(uid);
    if (!customer) throw new NotFoundError('Customer not found');
    return customer;
  };