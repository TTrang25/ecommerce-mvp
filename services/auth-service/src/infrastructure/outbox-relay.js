const { pool } = require('./db');
const { producer, ensureTopics } = require('./kafka');

const BATCH_SIZE = 50;
const TOPICS = ['user-registered'];

// Đọc các event chưa gửi, gửi lên Kafka, rồi đánh dấu đã gửi.
// Giao hàng "ít nhất một lần": nếu lỗi giữa chừng, event có thể bị gửi lại,
// nên bên nhận phải xử lý trùng lặp dựa trên eventId.
async function publishPending() {
  const client = await pool.connect();
  let failure = null;
  let sentCount = 0;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT id, topic, event_key, payload
         FROM outbox_events
        WHERE published_at IS NULL
        ORDER BY id
        LIMIT $1
        FOR UPDATE SKIP LOCKED`,
      [BATCH_SIZE]
    );

    const sentIds = [];
    for (const row of rows) {
      try {
        await producer.send({
          topic: row.topic,
          messages: [{ key: row.event_key, value: JSON.stringify(row.payload) }],
        });
        sentIds.push(row.id);
      } catch (err) {
        failure = err;
        break; // giữ đúng thứ tự: dừng ở event lỗi, các event sau để lần sau
      }
    }

    if (sentIds.length > 0) {
      await client.query(
        `UPDATE outbox_events SET published_at = now() WHERE id = ANY($1::bigint[])`,
        [sentIds]
      );
    }
    await client.query('COMMIT');
    sentCount = sentIds.length;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  if (failure) throw failure;
  return sentCount;
}

function startOutboxRelay({ intervalMs }) {
  let stopped = false;
  let connected = false;
  let timer = null;

  async function tick() {
    if (stopped) return;
    try {
      if (!connected) {
        await producer.connect();
        await ensureTopics(TOPICS);
        connected = true;
        console.log('[outbox] connected to Kafka');
      }
      const sent = await publishPending();
      if (sent > 0) console.log(`[outbox] published ${sent} event(s)`);
    } catch (err) {
      console.error('[outbox] publish failed, will retry:', err.message);
      if (connected) {
        connected = false;
        await producer.disconnect().catch(() => {});
      }
    } finally {
      if (!stopped) timer = setTimeout(tick, intervalMs);
    }
  }

  tick();

  return async function stop() {
    stopped = true;
    clearTimeout(timer);
    await producer.disconnect().catch(() => {});
  };
}

module.exports = { startOutboxRelay, publishPending };