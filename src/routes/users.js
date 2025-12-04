// src/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /users
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('DB QUERY ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
