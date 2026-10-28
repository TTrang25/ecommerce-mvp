require('../config'); // đảm bảo .env đã được nạp
const { Kafka, logLevel } = require('kafkajs');
const { createCustomerFromEvent } = require('./customer-event-repository');

const TOPIC = 'user-registered';
const GROUP_ID = 'customer-service';

function parseEvent(buffer) {
  const event = JSON.parse(buffer.toString());
  if (!event.eventId || !Number.isInteger(event.uid) || !event.username) {
    throw new Error('missing eventId/uid/username');
  }
  return event;
}

// Xử lý 1 message. Tách riêng để dễ kiểm thử.
async function handleMessage({ message }) {
  let event;
  try {
    event = parseEvent(message.value);
  } catch (err) {
    // Message hỏng: ghi nhận lỗi rồi bỏ qua, không retry vô hạn
    console.error('[consumer] skip invalid message:', err.message);
    return;
  }
  // Nếu DB lỗi, hàm này throw => KafkaJS không commit offset và sẽ giao lại
  const processed = await createCustomerFromEvent(event);
  console.log(
    processed
      ? `[consumer] processed event for uid=${event.uid}`
      : `[consumer] duplicate event ${event.eventId}, skipped`
  );
}

async function startUserRegisteredConsumer() {
  const kafka = new Kafka({
    clientId: 'customer-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:29092').split(','),
    logLevel: logLevel.WARN,
  });
  const consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  await consumer.run({ eachMessage: handleMessage });
  console.log(`[consumer] listening on topic "${TOPIC}"`);
  return () => consumer.disconnect();
}

module.exports = { startUserRegisteredConsumer, handleMessage };