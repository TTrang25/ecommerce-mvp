const { Kafka } = require('kafkajs');

const config = require('../config');
const shipmentService = require('../application/shipment-service');

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers
});

const consumer = kafka.consumer({
  groupId: config.kafka.groupId
});

async function startConsumer() {
  await consumer.connect();

  console.log('Kafka Consumer connected');

  await consumer.subscribe({
    topic: 'order-created',
    fromBeginning: true
  });

  console.log(
    'Kafka Consumer subscribed to order-created'
  );

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const value = message.value
          ? JSON.parse(message.value.toString())
          : null;

        console.log(
          'Received OrderCreated event:',
          value
        );

        if (!value) {
          console.error(
            'OrderCreated event payload is empty'
          );

          return;
        }

        await shipmentService.handleOrderCreated(value);
      } catch (error) {
        console.error(
          'Failed to process OrderCreated event:',
          error
        );
      }
    }
  });
}

async function stopConsumer() {
  await consumer.disconnect();

  console.log('Kafka Consumer disconnected');
}

module.exports = {
  startConsumer,
  stopConsumer
};