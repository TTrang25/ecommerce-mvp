require('dotenv').config();

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

module.exports = {
  port: Number(process.env.PORT || 3003),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27018/product_db',
  },
  jwt: {
    secret: required('JWT_SECRET'),
  },
};