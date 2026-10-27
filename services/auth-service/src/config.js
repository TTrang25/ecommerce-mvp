require('dotenv').config();

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

module.exports = {
  port: Number(process.env.PORT || 3001),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5433),
    user: process.env.DB_USER || 'app',
    password: required('DB_PASSWORD'),
    database: process.env.DB_NAME || 'auth_db',
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresInSec: Number(process.env.JWT_EXPIRES_IN_SEC || 3600),
  },
};