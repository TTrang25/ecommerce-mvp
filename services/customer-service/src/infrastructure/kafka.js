const { Kafka, logLevel } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka({
  clientId: 'customer-service',
  brokers: config.kafka.brokers,
  logLevel: logLevel.WARN,
});

// Chỉ tạo những topic còn thiếu (tránh log lỗi "topic đã tồn tại")
async function ensureTopics(topics) {
  const admin = kafka.admin();
  await admin.connect();
  try {
    const existing = await admin.listTopics();
    const missing = topics.filter((topic) => !existing.includes(topic));
    if (missing.length > 0) {
      await admin.createTopics({
        waitForLeaders: true,
        topics: missing.map((topic) => ({ topic, numPartitions: 3, replicationFactor: 1 })),
      });
    }
  } finally {
    await admin.disconnect();
  }
}

module.exports = { kafka, ensureTopics };