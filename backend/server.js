// server.js
require('dotenv').config();
const fs = require('fs');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Start server first, then rebuild index in background
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Rebuild index after server starts (non-blocking)
const { rebuildIndex } = require('./src/services/indexingService');
rebuildIndex().then(() => {
  console.log('Initial index rebuild completed');
}).catch(err => {
  console.error('Initial index rebuild failed:', err);
});

// Graceful shutdown (optional)
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
  });
});