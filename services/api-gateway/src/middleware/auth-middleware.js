require('dotenv').config();

const jwt = require('jsonwebtoken');

console.log(
  'Gateway JWT secret loaded:',
  process.env.JWT_SECRET ? 'YES' : 'NO'
);

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  console.log(
    'Gateway Authorization:',
    authHeader ? 'Bearer token received' : 'No token'
  );

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access token is required'
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log(
      'Gateway JWT verified:',
      payload
    );

    req.user = payload;

    next();
  } catch (error) {
    console.error(
      'Gateway JWT verification failed:',
      error.message
    );

    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}

module.exports = authenticateToken;