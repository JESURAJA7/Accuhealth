import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT id, name, email, description, is_active FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(results);
  });
});

router.post('/', authenticateToken, async (req, res) => {
  const { name, email, password, description } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (name, email, password, description) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, hashedPassword, description], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to create user' });
    res.status(201).json({ message: 'User created successfully' });
  });
});

router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const query = 'UPDATE users SET is_active = ? WHERE id = ?';
    db.query(query, [is_active, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user status' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ 
        message: 'User status updated successfully',
        is_active: is_active
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//add user
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, description } = req.body;
  let query = 'UPDATE users SET name = ?, email = ?, description = ?';
  const params = [name, email, description];

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update user' });
    res.json({ message: 'User updated successfully' });
  });
});

export default router;
