const app = require('./app');
const config = require('./config');

const {
  connectMongo,
  disconnectMongo
} = require('./infrastructure/db');

const {
  startConsumer,
  stopConsumer
} = require('./infrastructure/kafka-consumer');

async function startServer() {
  try {
    /*
     * 1. Kết nối MongoDB
     */
    await connectMongo();

    /*
     * 2. Chạy HTTP Server
     */
    app.listen(config.port, () => {
      console.log(
        `Shipment Service is running on port ${config.port}`
      );
    });

    /*
     * 3. Chạy Kafka Consumer
     */
    await startConsumer();

  } catch (error) {
    console.error(
      'Failed to start Shipment Service:',
      error
    );

    process.exit(1);
  }
}

async function shutdown() {
  try {
    console.log(
      'Shutting down Shipment Service...'
    );

    await stopConsumer();
    await disconnectMongo();

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