const mongoose = require('mongoose');
const config = require('../config');

// Báo lỗi sau 5 giây nếu không tìm thấy MongoDB, thay vì treo mãi
async function connectMongo() {
  await mongoose.connect(config.mongo.uri, { serverSelectionTimeoutMS: 5000 });
}

module.exports = { mongoose, connectMongo };