require('dotenv').config();

const config = {
  port: Number(process.env.PORT || 3005),

  mongoUri: process.env.MONGODB_URI,

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:29092')
      .split(','),

    clientId:
      process.env.KAFKA_CLIENT_ID || 'shipment-service',

    groupId:
      process.env.KAFKA_GROUP_ID || 'shipment-service-group'
  }
};

module.exports = config;