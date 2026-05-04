// backend/src/config/redis.js
const Redis = require('ioredis');

let redisClient = null;
let useRedis = false;

// Only try to connect if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`Redis reconnecting in ${delay}ms...`);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
      useRedis = true;
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error:', err.message);
      useRedis = false;
    });

    // For immediate use, set to true (will be updated on connect)
    useRedis = true;
  } catch (err) {
    console.warn('⚠️ Redis configuration failed:', err.message);
    console.warn('Using in‑memory index only');
    useRedis = false;
    redisClient = null;
  }
} else {
  console.log('📁 Using in‑memory index (REDIS_URL not set)');
}

module.exports = { redisClient, useRedis };