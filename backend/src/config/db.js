// backend/src/config/db.js
const { Pool } = require('pg');

let pool = null;
let useDatabase = false;

// Helper to properly handle SSL for Render
const getSSLConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    // For Render's internal PostgreSQL, we need to disable SSL verification
    // because they use self-signed certificates internally
    return { rejectUnauthorized: false };
  }
  return false;
};

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
      ssl: getSSLConfig(),
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
    
    // Parse and rebuild connection string with proper SSL
    const url = new URL(connectionString);
    
    // Add sslmode=require to disable certificate verification
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }
    
    // Also add rejectUnauthorized false by using ssl=true
    if (!url.searchParams.has('ssl')) {
      url.searchParams.set('ssl', 'true');
    }
    
    const finalConnectionString = url.toString();
    
    pool = new Pool({
      connectionString: finalConnectionString,
      ssl: { rejectUnauthorized: false }, // Critical for Render
    });
    useDatabase = true;
    console.log('✅ PostgreSQL configured via DATABASE_URL');
    console.log('Connection string (host hidden):', url.hostname);
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
    const result = await client.query('SELECT version()');
    console.log('✅ PostgreSQL connection test successful');
    console.log('PostgreSQL version:', result.rows[0].version.split(',')[0]);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection test failed:', err.message);
    useDatabase = false;
    return false;
  }
};

// Test connection if PostgreSQL is enabled (with delay to allow pool to initialize)
if (useDatabase) {
  setTimeout(() => {
    testDbConnection().catch(console.error);
  }, 1000);
}

module.exports = { pool, useDatabase, testDbConnection };
