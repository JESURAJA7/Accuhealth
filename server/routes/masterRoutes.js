import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const masters = [
    { id: 'role', name: 'Role', icon: 'users' },
    { id: 'category', name: 'Category', icon: 'grid' },
    { id: 'dose-number', name: 'Dose Number', icon: 'monitor' },
    { id: 'education', name: 'Education', icon: 'graduation-cap' },
    { id: 'governorate', name: 'Governorate', icon: 'briefcase' },
    { id: 'wilayat', name: 'Wilayat', icon: 'globe' },
    { id: 'governorate-vaccinated', name: 'Governorate vaccinated', icon: 'users' },
    { id: 'institution', name: 'Institution', icon: 'building' },
    { id: 'institution-place', name: 'Institution/Place of vaccination', icon: 'map-pin' },
    { id: 'nationality', name: 'Nationality', icon: 'flag' },
    { id: 'occupation', name: 'Occupation', icon: 'briefcase' },
    { id: 'source', name: 'Source', icon: 'share' },
    { id: 'site-injection', name: 'Site of Injection', icon: 'syringe' },
    { id: 'treatment', name: 'Treatment', icon: 'clipboard-list' },
    { id: 'vaccine-manufacturer', name: 'Vaccine Manufacturer', icon: 'users' },
    { id: 'vaccine-name', name: 'Vaccine Name', icon: 'syringe' },
    { id: 'vaccine-type', name: 'Vaccine Type', icon: 'syringe' },
    { id: 'vaccination-unit', name: 'Vaccination Unit', icon: 'syringe' }
  ];

  res.json(masters);
});


router.post('/roles', authenticateToken, (req, res) => {
  try {
    const { code, name, description, isActive } = req.body;
    
    const query = 'INSERT INTO roles (name, description, is_active) VALUES (?, ?, ?)';
    db.query(query, [name, description, isActive], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create role' });
      }
      res.status(201).json({ message: 'Role created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/categories', authenticateToken, (req, res) => {
  try {
    const { code, name, description, isActive } = req.body;
    
    const query = 'INSERT INTO categories (name, description, is_active) VALUES (?, ?, ?)';
    db.query(query, [name, description, isActive], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create category' });
      }
      res.status(201).json({ message: 'Category created successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
export default router;
