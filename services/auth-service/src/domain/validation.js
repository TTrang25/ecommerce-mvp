const { ValidationError } = require('./errors');

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{8,15}$/;

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

function validateRegistration(input = {}) {
  const { username, password, email, phone } = input;

  if (!isNonEmptyString(username)) throw new ValidationError('username is required');
  if (!isNonEmptyString(password)) throw new ValidationError('password is required');
  if (!isNonEmptyString(email)) throw new ValidationError('email is required');

  if (!USERNAME_RE.test(username.trim())) {
    throw new ValidationError('username must be 3-50 characters: letters, digits, . _ -');
  }
  if (password.length < 6 || Buffer.byteLength(password) > 72) {
    throw new ValidationError('password must be 6-72 characters');
  }
  if (email.trim().length > 100 || !EMAIL_RE.test(email.trim())) {
    throw new ValidationError('email is invalid');
  }

  const hasPhone = phone !== undefined && phone !== null && String(phone).trim() !== '';
  if (hasPhone && !PHONE_RE.test(String(phone).trim())) {
    throw new ValidationError('phone must be 8-15 digits, optional leading +');
  }

  return {
    username: username.trim(),
    password,
    email: email.trim().toLowerCase(),
    phone: hasPhone ? String(phone).trim() : null,
  };
}

function validateLogin(input = {}) {
  const { username, password } = input;
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    throw new ValidationError('username and password are required');
  }
  return { username: username.trim(), password };
}

module.exports = { validateRegistration, validateLogin };