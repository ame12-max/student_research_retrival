// backend/src/config/index.js
const dotenv = require('dotenv');
const path = require('path');

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  
  // Feature flags (auto-detected)
  useDatabase: !!process.env.DATABASE_URL,
  useRedis: !!process.env.REDIS_URL,
  
  // Rate limiting defaults (will apply even without DB/Redis)
  rateLimit: {
    search: { windowMs: 60 * 1000, max: 30 },
    auth: { windowMs: 15 * 60 * 1000, max: 5 },
    admin: { windowMs: 15 * 60 * 1000, max: 100 }
  }
};

// Validate critical config
if (!config.jwtSecret) {
  console.error('❌ FATAL: JWT_SECRET is not defined in .env');
  console.error('Please add JWT_SECRET=your_secret_key to your .env file');
  process.exit(1);
}

console.log(`📋 Configuration loaded:`);
console.log(`   Environment: ${config.env}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.useDatabase ? 'PostgreSQL ✅' : 'JSON 📁'}`);
console.log(`   Redis: ${config.useRedis ? 'Redis ✅' : 'Memory 📁'}`);

module.exports = { config };