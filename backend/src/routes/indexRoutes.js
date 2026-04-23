// src/routes/indexRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { rebuildIndex, getIndexStats } = require('../services/indexingService');

const router = express.Router();

router.get('/stats', authMiddleware, (req, res) => {
  const stats = getIndexStats();
  res.json({ status: 'success', stats });
});

router.post('/rebuild', authMiddleware, async (req, res) => {
  await rebuildIndex();
  const stats = getIndexStats();
  res.json({ status: 'success', message: 'Index rebuilt', stats });
});

module.exports = router;