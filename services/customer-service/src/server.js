const config = require('./config');
const { initSchema, pool } = require('./infrastructure/db');
const { startUserRegisteredConsumer } = require('./infrastructure/user-registered-consumer');
const { createApp } = require('./app');

async function main() {
  await initSchema();
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`customer-service listening on port ${config.port}`);
  });

  const stopConsumer = startUserRegisteredConsumer();

  const shutdown = async () => {
    server.close();
    await stopConsumer();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start customer-service:', err);
  process.exit(1);
});