import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET - Initialize DB Table (Helper for setup)
router.get('/init-table', async (req, res) => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS hev_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      governorate VARCHAR(255),
      wilayat VARCHAR(255),
      institution VARCHAR(255),
      reporting_date DATE,
      patient_id VARCHAR(255),
      civil_id VARCHAR(255),
      expiry_date DATE,
      dob DATE,
      age INT,
      term VARCHAR(50),
      passport_no VARCHAR(255),
      nationality VARCHAR(255),
      first_name VARCHAR(255),
      second_name VARCHAR(255),
      third_name VARCHAR(255),
      fourth_name VARCHAR(255),
      gender VARCHAR(50),
      tribe VARCHAR(255),
      sheikh_name VARCHAR(255),
      mobile_no VARCHAR(50),
      next_of_kin_mobile VARCHAR(50),
      patient_governorate VARCHAR(255),
      patient_wilayat VARCHAR(255),
      village VARCHAR(255),
      sub_locality VARCHAR(255),
      symptoms JSON,
      hev_igm VARCHAR(50),
      hev_igg VARCHAR(50),
      hev_pcr VARCHAR(50),
      hev_pcr_value VARCHAR(255),
      alt VARCHAR(255),
      ast VARCHAR(255),
      outcome VARCHAR(255),
      remarks TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.query(createTableQuery);
    res.json({ message: 'Table hev_notifications created or already exists' });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Failed to create table', details: error.message });
  }
});

// GET - Check if table exists
router.get('/check-table', authenticateToken, (req, res) => {
  const query = `
    SELECT COUNT(*) as table_exists
    FROM information_schema.tables
    WHERE table_schema = ? AND table_name = 'hev_notifications'
  `;

  db.query(query, [process.env.DB_NAME || 'malaria_system'], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error checking table', details: err.message });
    }
    const tableExists = results[0].table_exists > 0;
    res.json({ tableExists, database: process.env.DB_NAME || 'malaria_system', table: 'hev_notifications' });
  });
});

// POST - Create new HEV notification
router.post('/', authenticateToken, (req, res) => {
  const formData = req.body;

  // Basic validation
  if (!formData.patientId || !formData.reportingDate) {
    return res.status(400).json({ error: 'Missing required fields (patientId, reportingDate)' });
  }

  const fieldMap = {
    governorate: 'governorate',
    wilayat: 'wilayat',
    institution: 'institution',
    reportingDate: 'reporting_date',
    patientId: 'patient_id',
    civilId: 'civil_id',
    expiryDate: 'expiry_date',
    dob: 'dob',
    age: 'age',
    term: 'term',
    passportNo: 'passport_no',
    nationality: 'nationality',
    firstName: 'first_name',
    secondName: 'second_name',
    thirdName: 'third_name',
    fourthName: 'fourth_name',
    gender: 'gender',
    tribe: 'tribe',
    sheikhName: 'sheikh_name',
    mobileNo: 'mobile_no',
    nextOfKinMobile: 'next_of_kin_mobile',
    patientGovernorate: 'patient_governorate',
    patientWilayat: 'patient_wilayat',
    village: 'village',
    subLocality: 'sub_locality',
    symptoms: 'symptoms',
    hevIgM: 'hev_igm',
    hevIgG: 'hev_igg',
    hevPcr: 'hev_pcr',
    hevPcrValue: 'hev_pcr_value',
    alt: 'alt',
    ast: 'ast',
    outcome: 'outcome',
    remarks: 'remarks'
  };

  const columns = [];
  const placeholders = [];
  const values = [];

  Object.keys(fieldMap).forEach(field => {
    if (formData[field] !== undefined && formData[field] !== '') {
      columns.push(fieldMap[field]);
      placeholders.push('?');

      if (field === 'symptoms') {
        values.push(JSON.stringify(formData[field] || []));
      } else {
        values.push(formData[field]);
      }
    }
  });

  const query = `INSERT INTO hev_notifications (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating HEV notification:', err);
      return res.status(500).json({ error: 'Failed to create HEV notification', details: err.message });
    }
    res.status(201).json({ message: 'HEV Notification created successfully', id: result.insertId });
  });
});

// GET - Get all HEV notifications (with optional search)
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 35, search } = req.query;
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM hev_notifications`;
  const queryParams = [];

  if (search) {
    query += ` WHERE first_name LIKE ? OR patient_id LIKE ? OR civil_id LIKE ?`;
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(limit), parseInt(offset));

  // Count query for pagination
  let countQuery = `SELECT COUNT(*) as total FROM hev_notifications`;
  const countParams = [];
  
  if (search) {
      countQuery += ` WHERE first_name LIKE ? OR patient_id LIKE ? OR civil_id LIKE ?`;
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(countQuery, countParams, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch count', details: err.message });
    }

    db.query(query, queryParams, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
      }

       // Parse JSON fields
       const notifications = results.map(row => {
        if (row.symptoms) {
            try {
                row.symptoms = JSON.parse(row.symptoms);
            } catch (e) {
                row.symptoms = [];
            }
        }
        return row;
       });

      res.json({
        notifications,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(countResult[0].total / limit),
            totalItems: countResult[0].total,
            itemsPerPage: parseInt(limit)
        }
      });
    });
  });
});

export default router;
