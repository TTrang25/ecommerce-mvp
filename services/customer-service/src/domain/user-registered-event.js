const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_INT = 2147483647;

// Trả về chuỗi mô tả lỗi, hoặc null nếu event hợp lệ
function validateUserRegisteredEvent(event) {
  if (!event || typeof event !== 'object') return 'event must be an object';
  if (typeof event.eventId !== 'string' || !UUID_RE.test(event.eventId)) {
    return 'eventId must be a UUID';
  }
  if (!Number.isInteger(event.uid) || event.uid < 1 || event.uid > MAX_INT) {
    return 'uid must be a positive integer';
  }
  if (typeof event.username !== 'string' || event.username.trim() === '' || event.username.length > 100) {
    return 'username is required (max 100 characters)';
  }
  return null;
}

module.exports = { validateUserRegisteredEvent };