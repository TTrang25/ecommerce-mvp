const mongoose = require('mongoose');

require('dotenv').config();

async function connectMongo() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log('Shipment Service MongoDB connected');
}

async function disconnectMongo() {
  await mongoose.disconnect();

  console.log('Shipment Service MongoDB disconnected');
}

module.exports = {
  connectMongo,
  disconnectMongo
};