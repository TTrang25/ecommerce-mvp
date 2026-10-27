const config = require('./config');
const { initSchema, pool } = require('./infrastructure/db');
const userRepository = require('./infrastructure/user-repository');
const passwordHasher = require('./infrastructure/password-hasher');
const { startOutboxRelay } = require('./infrastructure/outbox-relay');
const makeSeedAdmin = require('./application/seed-admin');
const { createApp } = require('./app');

async function main() {
  await initSchema();
  await makeSeedAdmin({ userRepository, passwordHasher, adminConfig: config.admin })();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`auth-service listening on port ${config.port}`);
  });

  // Kafka lỗi không làm service sập: đăng ký/đăng nhập vẫn chạy, event nằm chờ trong outbox
  const stopRelay = startOutboxRelay({ intervalMs: config.outbox.intervalMs });

  const shutdown = async () => {
    server.close();
    await stopRelay();
    await pool.end();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start auth-service:', err);
  process.exit(1);
});