const { parseUid, validateUpdate } = require('../domain/validation');
const { NotFoundError, ForbiddenError, ValidationError } = require('../domain/errors');
const { canAccess, isAdmin } = require('./access-policy');

module.exports = ({ customerRepository }) =>
  async function updateCustomer({ requester, rawUid, input }) {
    const uid = parseUid(rawUid);
    const changes = validateUpdate(input);

    if (!canAccess(requester, uid)) throw new NotFoundError('Customer not found');

    const existing = await customerRepository.findByUid(uid);
    if (!existing) throw new NotFoundError('Customer not found');

    if (changes.mid !== undefined) {
      // Chỉ Admin được đổi hạng thành viên, để khách không tự nâng hạng lấy giảm giá
      if (!isAdmin(requester) && changes.mid !== existing.mid) {
        throw new ForbiddenError('Only admin can change membership');
      }
      if (!(await customerRepository.membershipExists(changes.mid))) {
        throw new ValidationError('mid does not exist');
      }
    }

    const updated = await customerRepository.update(uid, changes);
    if (!updated) throw new NotFoundError('Customer not found');
    return { message: 'Customer updated successfully', uid };
  };