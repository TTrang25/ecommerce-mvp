const config = require('../config');
const { kafka, ensureTopics } = require('./kafka');
const { validateUserRegisteredEvent } = require('../domain/user-registered-event');
const { createCustomerFromEvent } = require('./customer-event-repository');

const TOPIC = 'user-registered';
const RETRY_MS = 5000;

async function handleMessage({ message }) {
  let event;
  try {
    event = JSON.parse(message.value.toString());
  } catch (err) {
    console.warn('[consumer] skip message: invalid JSON');
    return;
  }

  const problem = validateUserRegisteredEvent(event);
  if (problem) {
    // Event hỏng thì bỏ qua (không thử lại mãi), tránh kẹt cả hàng đợi
    console.warn(`[consumer] skip invalid event: ${problem}`);
    return;
  }

  // Lỗi DB sẽ được ném ra để kafkajs thử lại, không mất event
  const result = await createCustomerFromEvent(event);
  console.log(`[consumer] event ${event.eventId} uid=${event.uid}: ${result}`);
}

// Kafka chưa sẵn sàng thì API vẫn chạy bình thường, consumer tự thử kết nối lại
function startUserRegisteredConsumer() {
  let stopped = false;
  let consumer = null;
  let timer = null;

  async function run() {
    if (stopped) return;
    consumer = kafka.consumer({ groupId: config.kafka.groupId });
    try {
      await consumer.connect();
      await ensureTopics([TOPIC]);
      await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
      await consumer.run({ eachMessage: handleMessage });
      console.log(`[consumer] listening on topic ${TOPIC}`);
    } catch (err) {
      console.error('[consumer] failed to start, will retry:', err.message);
      await consumer.disconnect().catch(() => {});
      if (!stopped) timer = setTimeout(run, RETRY_MS);
    }
  }

  run();

  return async function stop() {
    stopped = true;
    clearTimeout(timer);
    if (consumer) await consumer.disconnect().catch(() => {});
  };
}

module.exports = { startUserRegisteredConsumer, handleMessage };