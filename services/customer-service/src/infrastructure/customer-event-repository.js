const { pool } = require('./db');

const DEFAULT_MEMBERSHIP = 'BRONZE';

// Xử lý event user-registered trong MỘT transaction:
// ghi nhận eventId (chống xử lý trùng) + tạo Customer với hạng mặc định.
// Trả về: 'created' (tạo mới) | 'exists' (Customer đã có sẵn) | 'duplicate' (event đã xử lý trước đó)
async function createCustomerFromEvent(event) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const seen = await client.query(
      `INSERT INTO processed_events (event_id) VALUES ($1)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [event.eventId]
    );
    if (seen.rowCount === 0) {
      await client.query('ROLLBACK');
      return 'duplicate';
    }

    const membership = await client.query(
      'SELECT mid FROM memberships WHERE mname = $1',
      [DEFAULT_MEMBERSHIP]
    );
    // Nếu thiếu hạng mặc định thì báo lỗi (rollback) để event KHÔNG bị đánh dấu đã xử lý
    if (!membership.rows[0]) {
      throw new Error(`Default membership ${DEFAULT_MEMBERSHIP} not found`);
    }

    const inserted = await client.query(
      `INSERT INTO customers (uid, fullname, mid) VALUES ($1, $2, $3)
       ON CONFLICT (uid) DO NOTHING`,
      [event.uid, event.username.trim(), membership.rows[0].mid]
    );

    await client.query('COMMIT');
    return inserted.rowCount === 1 ? 'created' : 'exists';
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { createCustomerFromEvent };