const { pool } = require('./db');
const kafkaClient = require('./kafka-client');

async function publishPendingEvents() {
  const result = await pool.query(
    `
    SELECT *
    FROM outbox_events
    WHERE published_at IS NULL
    ORDER BY id
    LIMIT 10
    `
  );

  for (const event of result.rows) {
    try {
      await kafkaClient.sendMessage(
        event.topic,
        {
          key: event.event_key,
          value: event.payload
        }
      );

      await pool.query(
        `
        UPDATE outbox_events
        SET published_at = NOW()
        WHERE id = $1
        `,
        [event.id]
      );

      console.log(
        `Outbox event ${event.id} published successfully`
      );
    } catch (error) {
      console.error(
        `Failed to publish outbox event ${event.id}:`,
        error.message
      );
    }
  }
}

module.exports = {
  publishPendingEvents
};