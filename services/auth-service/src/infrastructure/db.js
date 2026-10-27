const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config.db);

async function initSchema() {
  const sql = fs.readFileSync(path.join(__dirname, '../../db/schema.sql'), 'utf8');
  await pool.query(sql);
}

module.exports = { pool, initSchema };