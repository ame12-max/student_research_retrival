// backend/src/config/db.js
const { Pool } = require('pg');

let pool = null;
let useDatabase = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // This is the key fix
      connectionTimeoutMillis: 10000,
    });
    useDatabase = true;
    console.log('✅ PostgreSQL configured via DATABASE_URL');
  } catch (err) {
    console.error('❌ PostgreSQL configuration failed:', err.message);
    useDatabase = false;
  }
} else {
  console.log('📁 DATABASE_URL not set, using JSON storage');
}

// Test connection immediately
if (useDatabase && pool) {
  (async () => {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      console.log('✅ PostgreSQL connected successfully');
      client.release();
    } catch (err) {
      console.error('❌ PostgreSQL connection failed:', err.message);
      useDatabase = false;
    }
  })();
}

module.exports = { pool, useDatabase };
