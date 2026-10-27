const { ValidationError } = require('./errors');

const MAX_INT = 2147483647;

function parseUid(raw) {
  if (!/^[0-9]+$/.test(String(raw))) throw new ValidationError('uid must be a positive integer');
  const uid = Number(raw);
  if (uid < 1 || uid > MAX_INT) throw new ValidationError('uid must be a positive integer');
  return uid;
}

// Trả về chỉ những trường được gửi lên: { fullname?, mid? }
function validateUpdate(input = {}) {
  const result = {};

  if (input.fullname !== undefined) {
    if (typeof input.fullname !== 'string' || input.fullname.trim().length === 0) {
      throw new ValidationError('fullname must be a non-empty string');
    }
    if (input.fullname.trim().length > 100) {
      throw new ValidationError('fullname must be at most 100 characters');
    }
    result.fullname = input.fullname.trim();
  }

  if (input.mid !== undefined) {
    if (!Number.isInteger(input.mid) || input.mid < 1 || input.mid > MAX_INT) {
      throw new ValidationError('mid must be a positive integer');
    }
    result.mid = input.mid;
  }

  if (Object.keys(result).length === 0) {
    throw new ValidationError('fullname or mid is required');
  }
  return result;
}

module.exports = { parseUid, validateUpdate };