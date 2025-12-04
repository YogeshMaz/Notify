// ✅ src/config/db.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', err => console.error('❌ PG pool error:', err.message));

// Test connection
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL Connected:', res.rows[0].now);
  } catch (err) {
    console.error('❌ DB CONNECTION FAILED:', err.message);
  }
})();

// ✅ Export an object with query
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
