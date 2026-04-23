const jwt = require('jsonwebtoken');
const { findUserByUsername, createUser } = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/hash');

const register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password required' });
  }

  const existing = findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ status: 'error', message: 'Username already exists' });
  }

  const hashed = await hashPassword(password);
  const newUser = await createUser(username, hashed);
  res.status(201).json({ status: 'success', message: 'Admin user created' });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password required' });
  }

  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ status: 'success', token, username: user.username });
};

const verify = (req, res) => {
  // authMiddleware already verified, just return success
  res.json({ status: 'success', valid: true, username: req.user.username });
};

module.exports = { register, login, verify };