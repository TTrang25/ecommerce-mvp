const app = require('./app');
const config = require('./config');

const { testConnection } = require('./infrastructure/db');
const kafkaClient = require('./infrastructure/kafka-client');
const outboxPublisher = require('./infrastructure/outbox-publisher');

async function startServer() {
  try {
    /*
     * 1. Kiểm tra Database
     */
    await testConnection();

    console.log(
      'Order Service database connected'
    );

    /*
     * 2. Kết nối Kafka Producer
     */
    await kafkaClient.connectProducer();

    /*
     * 3. Chạy HTTP Server
     */
    app.listen(config.port, () => {
      console.log(
        `Order Service is running on port ${config.port}`
      );
    });

    /*
     * 4. Chạy Outbox Publisher định kỳ
     *
     * Mỗi 5 giây:
     * - lấy event chưa publish
     * - gửi Kafka
     * - cập nhật published_at
     */
    await outboxPublisher.publishPendingEvents();

    setInterval(async () => {
      try {
        await outboxPublisher.publishPendingEvents();
      } catch (error) {
        console.error(
          'Outbox Publisher error:',
          error
        );
      }
    }, 5000);

  } catch (error) {
    console.error(
      'Failed to start Order Service:',
      error
    );

    process.exit(1);
  }
}

async function shutdown() {
  try {
    console.log(
      'Shutting down Order Service...'
    );

    await kafkaClient.disconnectProducer();

    process.exit(0);
  } catch (error) {
    console.error(
      'Shutdown error:',
      error
    );

    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();