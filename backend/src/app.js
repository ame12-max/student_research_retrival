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
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { strictLimiter, relaxedLimiter, authLimiter } = require('./middleware/rateLimit');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://student-research-retrival.onrender.com',
   frontendUrl,
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads/documents')));

// Custom logging middleware (only if logger is a function)
if (typeof logger === 'function') {
  app.use(logger);
} else {
  console.warn('Logger middleware is not a function, skipping');
}

// Routes - apply rate limiters
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/documents', relaxedLimiter, documentRoutes);
app.use('/api/v1/search', relaxedLimiter, searchRoutes);
app.use('/api/v1/index', strictLimiter, indexRoutes);

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
