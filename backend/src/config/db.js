// backend/src/config/db.js
const { Pool } = require('pg');

let pool = null;
let useDatabase = false;

// Get connection parameters from environment
const dbHost = process.env.DB_HOST;
const dbPort = parseInt(process.env.DB_PORT) || 5432;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

if (dbHost && dbUser && dbPassword && dbName) {
  try {
    pool = new Pool({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    useDatabase = true;
    console.log('✅ PostgreSQL configured with individual parameters');
  } catch (err) {
    console.warn('⚠️ PostgreSQL configuration failed:', err.message);
    useDatabase = false;
    pool = null;
  }
} else if (process.env.DATABASE_URL) {
  // Fallback to DATABASE_URL if provided (Render uses this)
  try {
    let connectionString = process.env.DATABASE_URL;
    
    // Add sslmode=require for Render PostgreSQL if not present
    if (!connectionString.includes('sslmode') && process.env.NODE_ENV === 'production') {
      connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
    }
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    useDatabase = true;
    console.log('✅ PostgreSQL configured via DATABASE_URL');
  } catch (err) {
    console.warn('⚠️ PostgreSQL configuration failed:', err.message);
    useDatabase = false;
    pool = null;
  }
} else {
  console.log('📁 Using JSON file storage (no PostgreSQL config)');
}

const testDbConnection = async () => {
  if (!useDatabase || !pool) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL connection test successful');
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection test failed:', err.message);
    useDatabase = false;
    return false;
  }
};

// Test connection if PostgreSQL is enabled
if (useDatabase) {
  testDbConnection().catch(console.error);
}

module.exports = { pool, useDatabase, testDbConnection };
