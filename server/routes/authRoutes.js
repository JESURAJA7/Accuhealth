import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
    db.query(query, [email, hashedPassword, name], (err) => {
      if (err) return res.status(500).json({ error: 'User registration failed' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '24h'
      });

      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
