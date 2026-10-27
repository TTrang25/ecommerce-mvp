const crypto = require('crypto');
const { pool } = require('./db');
const { ConflictError } = require('../domain/errors');

async function findByUsername(username) {
  const { rows } = await pool.query(
    `SELECT u.uid, u.username, u.password, r.rolename AS role
       FROM users u
       JOIN roles r ON r.roleid = u.roleid
      WHERE u.username = $1`,
    [username]
  );
  return rows[0] || null;
}

// Tạo User và ghi OutboxEvent trong CÙNG một transaction
async function createCustomerWithEvent({ username, passwordHash, email, phone }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roleResult = await client.query(
      `SELECT roleid FROM roles WHERE rolename = 'CUSTOMER'`
    );
    if (!roleResult.rows[0]) throw new Error('Role CUSTOMER not found: schema not seeded');

    const userResult = await client.query(
      `INSERT INTO users (username, password, email, phone, roleid)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING uid`,
      [username, passwordHash, email, phone, roleResult.rows[0].roleid]
    );
    const uid = userResult.rows[0].uid;

    const event = {
      eventId: crypto.randomUUID(),
      uid,
      username,
      email,
      occurredAt: new Date().toISOString(),
    };
    await client.query(
      `INSERT INTO outbox_events (topic, event_key, payload) VALUES ($1, $2, $3)`,
      ['user-registered', String(uid), JSON.stringify(event)]
    );

    await client.query('COMMIT');
    return uid;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      if (err.constraint === 'users_email_key') throw new ConflictError('Email already exists');
      throw new ConflictError('Username already exists');
    }
    throw err;
  } finally {
    client.release();
  }
}

// Tạo user theo tên role (dùng cho Admin/Shipment Staff), không phát event
async function createUserWithRoleName({ username, passwordHash, email, phone, roleName }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (username, password, email, phone, roleid)
       SELECT $1, $2, $3, $4, roleid FROM roles WHERE rolename = $5
       RETURNING uid`,
      [username, passwordHash, email, phone, roleName]
    );
    if (!rows[0]) throw new Error(`Role ${roleName} not found`);
    return rows[0].uid;
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'users_email_key') throw new ConflictError('Email already exists');
      throw new ConflictError('Username already exists');
    }
    throw err;
  }
}

module.exports = { findByUsername, createCustomerWithEvent, createUserWithRoleName };