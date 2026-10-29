const app = require('./app');
const config = require('./config');
const { connectMongo } = require('./infrastructure/db');

async function startServer() {
  try {
    await connectMongo();

    app.listen(config.port, () => {
      console.log(
        `Product Service is running on port ${config.port}`
      );
    });
  } catch (error) {
    console.error('Failed to start Product Service:', error);
    process.exit(1);
  }
}

startServer();