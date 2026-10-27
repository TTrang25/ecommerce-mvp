const { UnauthorizedError } = require('../../domain/errors');

module.exports = (tokenService) => (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return next(new UnauthorizedError('Missing or invalid token'));
  }
  try {
    const payload = tokenService.verify(token);
    const uid = Number(payload.sub);
    if (!Number.isInteger(uid) || !payload.role) throw new Error('Invalid token payload');
    req.user = { uid, role: payload.role };
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Missing or invalid token'));
  }
};