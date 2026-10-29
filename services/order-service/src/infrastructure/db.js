const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.databaseUrl
});

async function testConnection() {
  const result = await pool.query('SELECT 1 AS ok');
  return result.rows[0];
}

module.exports = {
  pool,
  testConnection
};