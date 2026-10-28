const dbModule = require('./db');
const pool = dbModule.pool || dbModule;

// Tạo Customer từ sự kiện user-registered, chống xử lý trùng theo eventId.
// Trả về true nếu tạo mới, false nếu sự kiện đã được xử lý trước đó.
async function createCustomerFromEvent({ eventId, uid, username }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ghi dấu "đã xử lý" trước. Nếu eventId đã có => bỏ qua, không tạo trùng.
    const seen = await client.query(
      `INSERT INTO processed_events (event_id) VALUES ($1)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [eventId]
    );
    if (seen.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    // Hạng mặc định = hạng có score thấp nhất
    const tier = await client.query(
      'SELECT mid FROM memberships ORDER BY score ASC LIMIT 1'
    );
    if (!tier.rows[0]) throw new Error('No membership tiers found: schema not seeded');

    await client.query(
      `INSERT INTO customers (uid, fullname, mid)
       VALUES ($1, $2, $3)
       ON CONFLICT (uid) DO NOTHING`,
      [uid, username, tier.rows[0].mid]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createCustomerFromEvent };