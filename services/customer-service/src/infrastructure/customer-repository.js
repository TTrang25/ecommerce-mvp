const { pool } = require('./db');
const { ValidationError } = require('../domain/errors');

async function findByUid(uid) {
  const { rows } = await pool.query(
    `SELECT c.uid, c.fullname, c.mid, m.mname, m.score
       FROM customers c
       JOIN memberships m ON m.mid = c.mid
      WHERE c.uid = $1`,
    [uid]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    uid: row.uid,
    fullname: row.fullname,
    mid: row.mid,
    membership: { mname: row.mname, score: row.score },
  };
}

async function membershipExists(mid) {
  const { rows } = await pool.query('SELECT 1 FROM memberships WHERE mid = $1', [mid]);
  return rows.length > 0;
}

// Chỉ cập nhật trường nào được gửi lên (undefined -> giữ nguyên)
async function update(uid, { fullname, mid }) {
  try {
    const { rows } = await pool.query(
      `UPDATE customers
          SET fullname   = COALESCE($2, fullname),
              mid        = COALESCE($3, mid),
              updated_at = now()
        WHERE uid = $1
        RETURNING uid`,
      [uid, fullname ?? null, mid ?? null]
    );
    return rows.length > 0;
  } catch (err) {
    if (err.code === '23503') throw new ValidationError('mid does not exist');
    throw err;
  }
}

module.exports = { findByUid, membershipExists, update };