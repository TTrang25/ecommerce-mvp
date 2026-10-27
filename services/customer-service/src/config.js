require('dotenv').config();

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

module.exports = {
  port: Number(process.env.PORT || 3002),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5434),
    user: process.env.DB_USER || 'app',
    password: required('DB_PASSWORD'),
    database: process.env.DB_NAME || 'customer_db',
  },
  jwt: {
    secret: required('JWT_SECRET'),
  },
};