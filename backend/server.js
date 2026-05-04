const { config } =  require('./src/config/index.js');
const { pool, useDatabase } = require('./src/config/db.js');
const { redisClient, useRedis } = require('./src/config/redis.js');
const app = require('./src/app.js');

// Validate required config
if (!config.jwtSecret) {
  console.error('FATAL: JWT_SECRET not set');
  process.exit(1);
}

const PORT = config.PORT || 5000;
// Initialize index
async function initializeIndex() {
  const { loadIndexFromRedis, rebuildIndex } = require('./src/services/indexingService');
  
  if (useRedis) {
    console.log('Attempting to load index from Redis...');
    const loaded = await loadIndexFromRedis();
    if (!loaded) {
      console.log('No Redis cache found, building index from documents...');
      await rebuildIndex();
    }
  } else {
    await rebuildIndex();
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');
  if (useDatabase && pool) await pool.end();
  if (useRedis && redisClient) await redisClient.quit();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const server = app.listen(PORT, '0.0.0.0',  async () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Mode: ${config.env}`);
  console.log(`Database: ${useDatabase ? 'PostgreSQL' : 'JSON'}`);
  console.log(`Redis: ${useRedis ? 'enabled' : 'disabled'}`);
  await initializeIndex();
});