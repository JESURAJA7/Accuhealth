import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/fever-rash/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST - Create new fever and rash entry
router.post('/', authenticateToken, upload.array('attachments', 10), (req, res) => {
  const formData = req.body;
  const files = req.files || [];

  // Required field validation
  const requiredFields = {
    institution: formData.institution,
    patientId: formData.patientId,
    dob: formData.dob,
    firstName: formData.firstName,
    gender: formData.gender,
    nationality: formData.nationality,
    occupations: formData.occupations,
    placeOfWork: formData.placeOfWork,
    patientGovernorate: formData.patientGovernorate,
    patientWilayat: formData.patientWilayat,
    village: formData.village,
    dateOfOnset: formData.dateOfOnset
  };

  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  
  if (missingFields.length > 0) {
    // Clean up uploaded files if validation fails
    files.forEach(file => {
      fs.unlinkSync(file.path);
    });
    
    return res.status(400).json({
      error: 'Missing required fields',
      missingFields
    });
  }

  // Map frontend field names to database column names
  const fieldMap = {
    // Notification Info
    governorate: 'governorate',
    wilayat: 'wilayat',
    institution: 'institution',
    reportingDate: 'reporting_date',
    
    // Patient Information
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
    gender: 'gender',
    tribe: 'tribe',
    sheikhName: 'sheikh_name',
    mobileNo: 'mobile_no',
    nextOfKinMobile: 'next_of_kin_mobile',
    maritalStatus: 'marital_status',
    education: 'education',
    workStatus: 'work_status',
    occupations: 'occupations',
    placeOfWork: 'place_of_work',
    monthlyIncome: 'monthly_income',
    patientGovernorate: 'patient_governorate',
    patientWilayat: 'patient_wilayat',
    village: 'village',
    latitude: 'latitude',
    longitude: 'longitude',
    
    // Clinical Details
    dateOfOnset: 'date_of_onset',
    remarks: 'remarks',
    clinicalSymptoms: 'clinical_symptoms',
    receivedMMR: 'received_mmr',
    
    // Exposure History
    abroadTravel: 'abroad_travel',
    tourismWork: 'tourism_work',
    massGathering: 'mass_gathering',
    
    // Outcome
    outcome: 'outcome',
    outcomeDate: 'outcome_date',
    
    // Classification
    classification: 'classification',
    finalOutcome: 'final_outcome',
    finalOutcomeDate: 'final_outcome_date',
    finalRemarks: 'final_remarks'
  };

  // Build dynamic query
  const columns = [];
  const placeholders = [];
  const values = [];

  Object.keys(fieldMap).forEach(field => {
    if (formData[field] !== undefined && formData[field] !== '') {
      columns.push(fieldMap[field]);
      placeholders.push('?');
      
      // Handle array fields
      if (field === 'clinicalSymptoms' && Array.isArray(formData[field])) {
        values.push(formData[field].join(','));
      } else {
        values.push(formData[field]);
      }
    }
  });

  if (columns.length === 0) {
    return res.status(400).json({
      error: 'No data provided'
    });
  }

  const query = `INSERT INTO fever_rash_entries (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  console.log('Query:', query);
  console.log('Values count:', values.length);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating fever rash entry:', err);
      // Clean up uploaded files if DB operation fails
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      
      return res.status(500).json({ 
        error: 'Failed to create fever rash entry',
        details: err.message,
        sqlMessage: err.sqlMessage
      });
    }
    
    const entryId = result.insertId;
    
    // Handle file attachments
    if (files.length > 0) {
      const attachmentQueries = files.map(file => {
        return new Promise((resolve, reject) => {
          const attachmentQuery = `
            INSERT INTO fever_rash_attachments 
            (fever_rash_entry_id, file_name, file_path, file_size, mime_type) 
            VALUES (?, ?, ?, ?, ?)
          `;
          
          db.query(attachmentQuery, [
            entryId,
            file.originalname,
            file.path,
            file.size,
            file.mimetype
          ], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      });
      
      Promise.all(attachmentQueries)
        .then(() => {
          console.log('Fever rash entry created successfully with ID:', entryId);
          res.status(201).json({
            message: 'Fever rash entry created successfully',
            entryId: entryId,
            id: entryId
          });
        })
        .catch(attachmentErr => {
          console.error('Error saving attachments:', attachmentErr);
          res.status(201).json({
            message: 'Fever rash entry created but attachments failed',
            entryId: entryId,
            id: entryId,
            warning: 'Some attachments could not be saved'
          });
        });
    } else {
      console.log('Fever rash entry created successfully with ID:', entryId);
      res.status(201).json({
        message: 'Fever rash entry created successfully',
        entryId: entryId,
        id: entryId
      });
    }
  });
});

// GET - Get all fever rash entries with pagination and filtering
router.get('/', authenticateToken, (req, res) => {
  try {
    const {
      page = 1,
      limit = 35,
      search,
      institution,
      governorate,
      startDate,
      endDate,
      classification
    } = req.query;

    console.log('Fetching fever rash entries with query:', req.query);

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Build WHERE conditions for search
    if (search) {
      whereConditions.push('(first_name LIKE ? OR patient_id LIKE ? OR civil_id LIKE ? OR institution LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (institution && institution !== 'all') {
      whereConditions.push('institution = ?');
      queryParams.push(institution);
    }

    if (governorate && governorate !== 'all') {
      whereConditions.push('governorate = ?');
      queryParams.push(governorate);
    }

    if (startDate && endDate) {
      whereConditions.push('DATE(created_at) BETWEEN ? AND ?');
      queryParams.push(startDate, endDate);
    }

    // Classification filter
    if (classification && classification !== 'all') {
      whereConditions.push('classification = ?');
      queryParams.push(classification);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // First get total count
    const countQuery = `SELECT COUNT(*) as total FROM fever_rash_entries ${whereClause}`;
    
    console.log('Count query:', countQuery);
    console.log('Count params:', queryParams);

    db.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        console.error('Error counting fever rash entries:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to fetch fever rash entries',
          details: err.message 
        });
      }

      // Then get paginated entries
      const entriesQuery = `
        SELECT 
          id,
          governorate,
          wilayat,
          institution,
          reporting_date,
          patient_id,
          civil_id,
          expiry_date,
          dob,
          age,
          term,
          passport_no,
          nationality,
          first_name,
          second_name,
          third_name,
          gender,
          tribe,
          sheikh_name,
          mobile_no,
          next_of_kin_mobile,
          marital_status,
          education,
          work_status,
          occupations,
          place_of_work,
          monthly_income,
          patient_governorate,
          patient_wilayat,
          village,
          latitude,
          longitude,
          date_of_onset,
          remarks,
          clinical_symptoms,
          received_mmr,
          abroad_travel,
          tourism_work,
          mass_gathering,
          outcome,
          outcome_date,
          classification,
          final_outcome,
          final_outcome_date,
          final_remarks,
          created_at,
          updated_at
        FROM fever_rash_entries 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const entryParams = [...queryParams, parseInt(limit), offset];

      console.log('Entries query:', entriesQuery);
      console.log('Entries params:', entryParams);

      db.query(entriesQuery, entryParams, (err, entries) => {
        if (err) {
          console.error('Error fetching fever rash entries:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch fever rash entries',
            details: err.message 
          });
        }

        console.log(`Found ${entries.length} fever rash entries`);

        // Transform data for frontend
        const transformedEntries = entries.map(entry => ({
          id: entry.id,
          governorate: entry.governorate,
          wilayat: entry.wilayat,
          institution: entry.institution,
          reportingDate: entry.reporting_date,
          patientId: entry.patient_id,
          civilId: entry.civil_id,
          expiryDate: entry.expiry_date,
          dob: entry.dob,
          age: entry.age,
          term: entry.term,
          passportNo: entry.passport_no,
          nationality: entry.nationality,
          firstName: entry.first_name,
          secondName: entry.second_name,
          thirdName: entry.third_name,
          gender: entry.gender,
          tribe: entry.tribe,
          sheikhName: entry.sheikh_name,
          mobileNo: entry.mobile_no,
          nextOfKinMobile: entry.next_of_kin_mobile,
          maritalStatus: entry.marital_status,
          education: entry.education,
          workStatus: entry.work_status,
          occupations: entry.occupations,
          placeOfWork: entry.place_of_work,
          monthlyIncome: entry.monthly_income,
          patientGovernorate: entry.patient_governorate,
          patientWilayat: entry.patient_wilayat,
          village: entry.village,
          latitude: entry.latitude,
          longitude: entry.longitude,
          dateOfOnset: entry.date_of_onset,
          remarks: entry.remarks,
          clinicalSymptoms: entry.clinical_symptoms ? entry.clinical_symptoms.split(',') : [],
          receivedMMR: entry.received_mmr,
          abroadTravel: entry.abroad_travel,
          tourismWork: entry.tourism_work,
          massGathering: entry.mass_gathering,
          outcome: entry.outcome,
          outcomeDate: entry.outcome_date,
          classification: entry.classification,
          finalOutcome: entry.final_outcome,
          finalOutcomeDate: entry.final_outcome_date,
          finalRemarks: entry.final_remarks,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at
        }));

        res.json({
          success: true,
          entries: transformedEntries,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(countResult[0].total / limit),
            totalItems: countResult[0].total,
            itemsPerPage: parseInt(limit)
          },
          filters: {
            search,
            institution,
            governorate,
            startDate,
            endDate,
            classification
          }
        });
      });
    });

  } catch (error) {
    console.error('Unexpected error in fever rash entries route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// GET - Get single fever rash entry by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM fever_rash_entries WHERE id = ?';
  
  db.query(query, [id], (err, entries) => {
    if (err) {
      console.error('Error fetching fever rash entry:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch fever rash entry',
        details: err.message 
      });
    }

    if (entries.length === 0) {
      return res.status(404).json({
        error: 'Fever rash entry not found'
      });
    }

    const entry = entries[0];

    // Parse array fields
    if (entry.clinical_symptoms) {
      entry.clinical_symptoms = entry.clinical_symptoms.split(',');
    }

    // Get related data
    const getRelatedData = () => {
      return new Promise((resolve, reject) => {
        const immunizationsQuery = 'SELECT * FROM fever_rash_immunizations WHERE fever_rash_entry_id = ?';
        const labTestsQuery = 'SELECT * FROM fever_rash_lab_tests WHERE fever_rash_entry_id = ?';
        const attachmentsQuery = 'SELECT * FROM fever_rash_attachments WHERE fever_rash_entry_id = ?';

        db.query(immunizationsQuery, [id], (err, immunizations) => {
          if (err) reject(err);
          else {
            db.query(labTestsQuery, [id], (err, labTests) => {
              if (err) reject(err);
              else {
                db.query(attachmentsQuery, [id], (err, attachments) => {
                  if (err) reject(err);
                  else resolve({ immunizations, labTests, attachments });
                });
              }
            });
          }
        });
      });
    };

    getRelatedData()
      .then(relatedData => {
        res.json({
          ...entry,
          immunizations: relatedData.immunizations,
          labTests: relatedData.labTests,
          attachments: relatedData.attachments
        });
      })
      .catch(err => {
        console.error('Error fetching related data:', err);
        res.json(entry); // Return main entry even if related data fails
      });
  });
});

// PUT - Update fever rash entry
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // First check if entry exists
  const checkQuery = 'SELECT id FROM fever_rash_entries WHERE id = ?';
  
  db.query(checkQuery, [id], (err, existing) => {
    if (err) {
      console.error('Error checking fever rash entry:', err);
      return res.status(500).json({ 
        error: 'Failed to update fever rash entry',
        details: err.message 
      });
    }

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Fever rash entry not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        // Handle array fields
        if (key === 'clinicalSymptoms') {
          updateValues.push(Array.isArray(updateData[key]) ? updateData[key].join(',') : updateData[key]);
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update'
      });
    }

    updateValues.push(id);

    const updateQuery = `
      UPDATE fever_rash_entries 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('Error updating fever rash entry:', err);
        return res.status(500).json({ 
          error: 'Failed to update fever rash entry',
          details: err.message 
        });
      }

      res.json({
        message: 'Fever rash entry updated successfully'
      });
    });
  });
});

// DELETE - Delete fever rash entry
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM fever_rash_entries WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting fever rash entry:', err);
      return res.status(500).json({ 
        error: 'Failed to delete fever rash entry',
        details: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Fever rash entry not found'
      });
    }

    res.json({
      message: 'Fever rash entry deleted successfully'
    });
  });
});

// GET - Get available filter options
router.get('/filters/options', authenticateToken, (req, res) => {
  const queries = {
    institutions: 'SELECT DISTINCT institution FROM fever_rash_entries WHERE institution IS NOT NULL ORDER BY institution',
    governorates: 'SELECT DISTINCT governorate FROM fever_rash_entries WHERE governorate IS NOT NULL ORDER BY governorate',
    classifications: 'SELECT DISTINCT classification FROM fever_rash_entries WHERE classification IS NOT NULL ORDER BY classification'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, data) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = [];
      } else {
        results[key] = data.map(item => item[key.split('s')[0]]);
      }
      
      completed++;
      if (completed === total) {
        res.json({
          success: true,
          filters: results
        });
      }
    });
  });
});

export default router;