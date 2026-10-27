class AppError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = { AppError, ValidationError, ConflictError, UnauthorizedError };