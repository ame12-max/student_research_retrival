// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const indexRoutes = require('./routes/indexRoutes');

// Import middleware (ensure files exist)
const logger = require('./middleware/logger'); // must export a function
const errorHandler = require('./middleware/errorHandler'); // optional but recommended

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads/documents')));


// Custom logging middleware (only if logger is a function)
if (typeof logger === 'function') {
  app.use(logger);
} else {
  console.warn('Logger middleware is not a function, skipping');
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/index', indexRoutes);

// Health check (public)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be after routes)
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
} else {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: err.message || 'Internal server error' });
  });
}

module.exports = app;