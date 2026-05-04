// backend/server.js
require('dotenv').config();
const fs = require('fs');
const app = require('./src/app');

// IMPORTANT: Render expects the port from environment variable
const PORT = process.env.PORT || 10000;

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}
if (!fs.existsSync('./uploads/documents')) {
  fs.mkdirSync('./uploads/documents', { recursive: true });
}

const { useDatabase } = require('./src/config/db');

// Initialize index function
async function initializeIndex() {
  const { rebuildIndex } = require('./src/services/indexingService');
  await rebuildIndex();
}

// CRITICAL: Listen on all interfaces (0.0.0.0) not just localhost
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${useDatabase ? 'PostgreSQL' : 'JSON'}`);
});

// Initialize index after server starts
initializeIndex().catch(console.error);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
