const { Kafka } = require('kafkajs');
const config = require('../config');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();

  console.log('Kafka Producer connected');
}

async function sendMessage(topic, message) {
  await producer.send({
    topic,
    messages: [
      {
        key: message.key,
        value: JSON.stringify(message.value)
      }
    ]
  });

  console.log(
    `Kafka message published to topic: ${topic}`
  );
}

async function disconnectProducer() {
  await producer.disconnect();

  console.log('Kafka Producer disconnected');
}

module.exports = {
  connectProducer,
  sendMessage,
  disconnectProducer
};