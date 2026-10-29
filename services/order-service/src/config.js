require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 3004),

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET,

  customerServiceUrl:
    process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002',

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:29092')
      .split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'order-service',
    groupId: process.env.KAFKA_GROUP_ID || 'order-service-group'
  }
};

module.exports = config;