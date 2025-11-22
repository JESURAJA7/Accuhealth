import express from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST - Create new notification
// POST - Create new notification (DYNAMIC VERSION)
router.post('/', authenticateToken, (req, res) => {
  const formData = req.body;

  // Required field validation
  const requiredFields = {
    institution: formData.institution,
    patientId: formData.patientId,
    firstName: formData.firstName,
    dob: formData.dob,
    placeOfWork: formData.placeOfWork,
    patientGovernorate: formData.patientGovernorate,
    nationality: formData.nationality,
    patientWilayat: formData.patientWilayat,
    gender: formData.gender,
    treatment: formData.treatment,
    dateOfOnset: formData.dateOfOnset
  };

  const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
  
  if (missingFields.length > 0) {
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
    
    // Patient Info
    patientId: 'patient_id',
    civilId: 'civil_id',
    expiryDate: 'expiry_date',
    age: 'age',
    firstName: 'first_name',
    secondName: 'second_name',
    dob: 'dob',
    term: 'term',
    mobileNo: 'mobile_no',
    nextOfKinMobileNo: 'next_of_kin_mobile_no',
    education: 'education',
    passportNo: 'passport_no',
    placeOfWork: 'place_of_work',
    monthlyIncome: 'monthly_income',
    patientGovernorate: 'patient_governorate',
    nationality: 'nationality',
    longitude: 'longitude',
    maritalStatus: 'marital_status',
    patientWilayat: 'patient_wilayat',
    gender: 'gender',
    workStatus: 'work_status',
    
    // Source Details
    treatment: 'treatment',
    treatmentStartDate: 'treatment_start_date',
    treatmentDose: 'treatment_dose',
    primaquine: 'primaquine',
    outcome: 'outcome',
    outcomeDate: 'outcome_date',
    remarks: 'remarks',
    
    // History Details
    dateOfOnset: 'date_of_onset',
    symptoms: 'symptoms',
    pastHistoryOfMalaria: 'past_history_of_malaria',
    bloodTransfusionWithinPast3Months: 'blood_transfusion_within_past_3_months',

    // Lab Results
    rdtReportedDate: 'rdt_reported_date',
    species: 'species',
    density: 'density',
    stages: 'stages',
    parasiteCount: 'parasite_count',
    relapse: 'relapse',

    // Other Details
    otherTreatment: 'other_treatment',
    otherTreatmentStartDate: 'other_treatment_start_date',
    treatmentEndDate: 'treatment_end_date',
    otherTreatmentDose: 'other_treatment_dose',
    otherPrimaquine: 'other_primaquine',
    otherOutcome: 'other_outcome',
    otherOutcomeDate: 'other_outcome_date',
    otherRemarks: 'other_remarks'
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
      if (['symptoms', 'species', 'stages'].includes(field) && Array.isArray(formData[field])) {
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

  const query = `INSERT INTO notifications (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

  console.log('Query:', query);
  console.log('Values count:', values.length);
  console.log('Values:', values);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error creating notification:', err);
      return res.status(500).json({ 
        error: 'Failed to create notification',
        details: err.message,
        sqlMessage: err.sqlMessage
      });
    }
    
    console.log('Notification created successfully with ID:', result.insertId);
    
    res.status(201).json({
      message: 'Notification created successfully',
      notificationId: result.insertId,
      id: result.insertId
    });
  });
});

// GET - Get all notifications with pagination and filtering
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
      status
    } = req.query;

    console.log('Fetching notifications with query:', req.query);

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

    // Status filter based on outcome
    if (status && status !== 'all') {
      if (status === 'saved') {
        whereConditions.push('outcome = ?');
        queryParams.push('cured');
      } else if (status === 'rejected') {
        whereConditions.push('outcome = ?');
        queryParams.push('died');
      } else if (status === 'pending') {
        whereConditions.push('(outcome IS NULL OR outcome NOT IN (?, ?))');
        queryParams.push('cured', 'died');
      }
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // First get total count
    const countQuery = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    
    console.log('Count query:', countQuery);
    console.log('Count params:', queryParams);

    db.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        console.error('Error counting notifications:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to fetch notifications',
          details: err.message 
        });
      }

      // Then get paginated notifications
      const notificationsQuery = `
        SELECT 
          id,
          patient_id,
          civil_id,
          first_name,
          second_name,
          institution,
          governorate,
          wilayat,
          treatment,
          outcome,
          age,
          gender,
          mobile_no,
          place_of_work,
          reporting_date,
          dob,
          expiry_date,
          term,
          next_of_kin_mobile_no,
          education,
          passport_no,
          monthly_income,
          patient_governorate,
          nationality,
          longitude,
          marital_status,
          patient_wilayat,
          work_status,
          treatment_start_date,
          treatment_dose,
          primaquine,
          outcome_date,
          remarks,
          date_of_onset,
          symptoms,
          past_history_of_malaria,
          blood_transfusion_within_past_3_months,
          rdt_reported_date,
          species,
          density,
          stages,
          parasite_count,
          relapse,
          other_treatment,
          other_treatment_start_date,
          treatment_end_date,
          other_treatment_dose,
          other_primaquine,
          other_outcome,
          other_outcome_date,
          other_remarks,
          created_at,
          updated_at
        FROM notifications 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const notificationParams = [...queryParams, parseInt(limit), offset];

      console.log('Notifications query:', notificationsQuery);
      console.log('Notifications params:', notificationParams);

      db.query(notificationsQuery, notificationParams, (err, notifications) => {
        if (err) {
          console.error('Error fetching notifications:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch notifications',
            details: err.message 
          });
        }

        console.log(`Found ${notifications.length} notifications`);

        // Transform data for frontend
        const transformedNotifications = notifications.map(notification => ({
          id: notification.id,
          patient_id: notification.patient_id,
          first_name: notification.first_name,
          second_name: notification.second_name,
          institution: notification.institution,
          governorate: notification.governorate,
          wilayat: notification.wilayat,
          treatment: notification.treatment,
          outcome: notification.outcome,
          age: notification.age,
          gender: notification.gender,
          mobile_no: notification.mobile_no,
          place_of_work: notification.place_of_work,
          reporting_date: notification.reporting_date,
          dob: notification.dob,
          expiry_date: notification.expiry_date,
          term: notification.term,
          next_of_kin_mobile_no: notification.next_of_kin_mobile_no,
          education: notification.education,
          passport_no: notification.passport_no,
          monthly_income: notification.monthly_income,
          patient_governorate: notification.patient_governorate,
          nationality: notification.nationality,
          longitude: notification.longitude,
          marital_status: notification.marital_status,
          patient_wilayat: notification.patient_wilayat,
          work_status: notification.work_status,
          treatment_start_date: notification.treatment_start_date,
          treatment_dose: notification.treatment_dose,
          primaquine: notification.primaquine,
          outcome_date: notification.outcome_date,
          remarks: notification.remarks,
          date_of_onset: notification.date_of_onset,
          symptoms: notification.symptoms ? notification.symptoms.split(',') : [],
          past_history_of_malaria: notification.past_history_of_malaria,
          blood_transfusion_within_past_3_months: notification.blood_transfusion_within_past_3_months,
          rdt_reported_date: notification.rdt_reported_date,
          species: notification.species ? notification.species.split(',') : [],
          density: notification.density,
          stages: notification.stages ? notification.stages.split(',') : [],
          parasite_count: notification.parasite_count,
          relapse: notification.relapse,
          other_treatment: notification.other_treatment,
          other_treatment_start_date: notification.other_treatment_start_date,
          treatment_end_date: notification.treatment_end_date,
          other_treatment_dose: notification.other_treatment_dose,
          other_primaquine: notification.other_primaquine,
          other_outcome: notification.other_outcome,
          other_outcome_date: notification.other_outcome_date,
          other_remarks: notification.other_remarks,
          created_at: notification.created_at,
          updated_at: notification.updated_at
        }));

        res.json({
          success: true,
          notifications: transformedNotifications,
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
            status
          }
        });
      });
    });

  } catch (error) {
    console.error('Unexpected error in notifications route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});


// GET - Get available filter options
router.get('/filters/options', authenticateToken, (req, res) => {
  const queries = {
    institutions: 'SELECT DISTINCT institution FROM notifications WHERE institution IS NOT NULL ORDER BY institution',
    governorates: 'SELECT DISTINCT governorate FROM notifications WHERE governorate IS NOT NULL ORDER BY governorate',
    outcomes: 'SELECT DISTINCT outcome FROM notifications WHERE outcome IS NOT NULL ORDER BY outcome'
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
        results[key] = data.map(item => item[key.split('s')[0]]); // Convert to simple array
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


// GET - Check if table exists
router.get('/check-table', authenticateToken, (req, res) => {
  const query = `
    SELECT COUNT(*) as table_exists 
    FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'notifications'
  `;
  
  db.query(query, [process.env.DB_NAME || 'malaria_system'], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Error checking table',
        details: err.message 
      });
    }
    
    const tableExists = results[0].table_exists > 0;
    
    res.json({
      tableExists: tableExists,
      database: process.env.DB_NAME || 'malaria_system',
      table: 'notifications'
    });
  });
});



// PUT - Update notification
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // First check if notification exists
  const checkQuery = 'SELECT id FROM notifications WHERE id = ?';
  
  db.query(checkQuery, [id], (err, existing) => {
    if (err) {
      console.error('Error checking notification:', err);
      return res.status(500).json({ 
        error: 'Failed to update notification',
        details: err.message 
      });
    }

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id') {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = ?`);
        
        // Handle JSON fields
        if (['symptoms', 'species', 'stages'].includes(key)) {
          updateValues.push(JSON.stringify(updateData[key] || []));
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
      UPDATE notifications 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({ 
          error: 'Failed to update notification',
          details: err.message 
        });
      }

      res.json({
        message: 'Notification updated successfully'
      });
    });
  });
});

// DELETE - Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM notifications WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting notification:', err);
      return res.status(500).json({ 
        error: 'Failed to delete notification',
        details: err.message 
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });
  });
});

// GET - Test database connection
router.get('/test/db', authenticateToken, (req, res) => {
  db.query('SELECT 1 as test', (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: err.message 
      });
    }
    res.json({ 
      message: 'Database connection successful',
      data: results 
    });
  });
});

// Add this route to check table structure
router.get('/table-structure', authenticateToken, (req, res) => {
  const query = `
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notifications'
    ORDER BY ORDINAL_POSITION
  `;
  
  db.query(query, [process.env.DB_NAME || 'malaria_system'], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Error checking table structure',
        details: err.message 
      });
    }
    
    res.json({
      columnCount: results.length,
      columns: results
    });
  });
});



// GET - Search notifications with advanced filtering (supports both basic and advanced search)
// GET - Search notifications with advanced filtering
router.get('/search', authenticateToken, (req, res) => {
  try {
    console.log('🔍 Search endpoint called with query:', req.query);
    
    const {
      patientId,
      name,
      gsmNo,
      sex,
      maritalStatus,
      ageFrom,
      ageTo,
      nationality,
      patientGovernorate,
      governorate,
      wilayat,
      reportingInstitute,
      finalOutcome,
      notificationId,
      reportingDate,
      finalOutcomeDate,
      caseDetectedVisa,
      labConfirmedCase,
      pastMalariaHistory,
      travelHistory,
      classification,
      hospitalType,
      species,
      page = 1,
      limit = 35
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Basic Search - Only Patient ID
    if (patientId && Object.keys(req.query).length === 2) { // patientId + page/limit
      // If only patientId is provided, do a quick search
      whereConditions.push('patient_id LIKE ?');
      queryParams.push(`%${patientId}%`);
      console.log('🔍 Basic search by Patient ID only');
    } else {
      // Advanced Search - All provided fields
      console.log('🔍 Advanced search with multiple criteria');

      // Patient Information Filters
      if (patientId) {
        whereConditions.push('patient_id LIKE ?');
        queryParams.push(`%${patientId}%`);
      }

      if (name) {
        whereConditions.push('(first_name LIKE ? OR second_name LIKE ?)');
        queryParams.push(`%${name}%`, `%${name}%`);
      }

      if (gsmNo) {
        whereConditions.push('mobile_no LIKE ?');
        queryParams.push(`%${gsmNo}%`);
      }

      if (sex) {
        whereConditions.push('gender = ?');
        queryParams.push(sex === 'M' ? 'Male' : 'Female');
      }

      if (maritalStatus) {
        whereConditions.push('marital_status = ?');
        queryParams.push(maritalStatus);
      }

      // Age range filter
      if (ageFrom && ageTo) {
        whereConditions.push('age BETWEEN ? AND ?');
        queryParams.push(parseInt(ageFrom), parseInt(ageTo));
      } else if (ageFrom) {
        whereConditions.push('age >= ?');
        queryParams.push(parseInt(ageFrom));
      } else if (ageTo) {
        whereConditions.push('age <= ?');
        queryParams.push(parseInt(ageTo));
      }

      if (nationality) {
        whereConditions.push('nationality LIKE ?');
        queryParams.push(`%${nationality}%`);
      }

      if (patientGovernorate) {
        whereConditions.push('patient_governorate = ?');
        queryParams.push(patientGovernorate);
      }

      // Location Information Filters
      if (governorate) {
        whereConditions.push('governorate = ?');
        queryParams.push(governorate);
      }

      if (wilayat) {
        whereConditions.push('wilayat = ?');
        queryParams.push(wilayat);
      }

      if (reportingInstitute) {
        whereConditions.push('institution = ?');
        queryParams.push(reportingInstitute);
      }

      if (finalOutcome) {
        whereConditions.push('outcome = ?');
        queryParams.push(finalOutcome);
      }

      // Date Information Filters
      if (notificationId) {
        whereConditions.push('id = ?');
        queryParams.push(notificationId);
      }

      if (reportingDate) {
        whereConditions.push('DATE(reporting_date) = ?');
        queryParams.push(reportingDate);
      }

      if (finalOutcomeDate) {
        whereConditions.push('DATE(outcome_date) = ?');
        queryParams.push(finalOutcomeDate);
      }

      // Clinical Information Filters
      if (caseDetectedVisa) {
        if (caseDetectedVisa === 'yes') {
          whereConditions.push('remarks LIKE ?');
          queryParams.push('%visa%');
        } else if (caseDetectedVisa === 'no') {
          whereConditions.push('(remarks NOT LIKE ? OR remarks IS NULL)');
          queryParams.push('%visa%');
        }
      }

      if (labConfirmedCase) {
        if (labConfirmedCase === 'yes') {
          whereConditions.push('(species IS NOT NULL AND species != "")');
        } else if (labConfirmedCase === 'no') {
          whereConditions.push('(species IS NULL OR species = "")');
        }
      }

      if (pastMalariaHistory) {
        if (pastMalariaHistory === 'yes') {
          whereConditions.push('past_history_of_malaria = ?');
          queryParams.push('Yes');
        } else if (pastMalariaHistory === 'no') {
          whereConditions.push('(past_history_of_malaria IS NULL OR past_history_of_malaria = ?)');
          queryParams.push('No');
        }
      }

      if (travelHistory) {
        if (travelHistory === 'yes') {
          whereConditions.push('remarks LIKE ?');
          queryParams.push('%travel%');
        } else if (travelHistory === 'no') {
          whereConditions.push('(remarks NOT LIKE ? OR remarks IS NULL)');
          queryParams.push('%travel%');
        }
      }

      if (classification) {
        if (classification === 'imported') {
          whereConditions.push('remarks LIKE ?');
          queryParams.push('%imported%');
        } else if (classification === 'local') {
          whereConditions.push('(remarks NOT LIKE ? OR remarks IS NULL)');
          queryParams.push('%imported%');
        }
      }

      if (hospitalType && hospitalType !== 'all') {
        if (hospitalType === 'moh') {
          whereConditions.push('institution LIKE ?');
          queryParams.push('%MOH%');
        } else if (hospitalType === 'non-moh') {
          whereConditions.push('(institution NOT LIKE ? OR institution IS NULL)');
          queryParams.push('%MOH%');
        }
      }

      // Species filter
      if (species) {
        const speciesArray = species.split(',');
        const speciesConditions = speciesArray.map(specie => {
          queryParams.push(`%${specie}%`);
          return 'species LIKE ?';
        });
        whereConditions.push(`(${speciesConditions.join(' OR ')})`);
      }
    }

    // Define whereClause here, before using it
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    console.log('📍 Final WHERE clause:', whereClause);
    console.log('📍 Query parameters:', queryParams);

    // First get total count
    const countQuery = `SELECT COUNT(*) as total FROM notifications ${whereClause}`;
    
    db.query(countQuery, queryParams, (err, countResult) => {
      if (err) {
        console.error('❌ Error counting search results:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to search notifications',
          details: err.message 
        });
      }

      // Then get paginated search results - RETURN ALL FIELDS
      const searchQuery = `
        SELECT 
          id,
          patient_id,
          civil_id,
          first_name,
          second_name,
          institution,
          governorate,
          wilayat,
          treatment,
          outcome,
          age,
          gender,
          mobile_no,
          place_of_work,
          reporting_date,
          dob,
          expiry_date,
          term,
          next_of_kin_mobile_no,
          education,
          passport_no,
          monthly_income,
          patient_governorate,
          nationality,
          longitude,
          marital_status,
          patient_wilayat,
          work_status,
          treatment_start_date,
          treatment_dose,
          primaquine,
          outcome_date,
          remarks,
          date_of_onset,
          symptoms,
          past_history_of_malaria,
          blood_transfusion_within_past_3_months,
          rdt_reported_date,
          species,
          density,
          stages,
          parasite_count,
          relapse,
          other_treatment,
          other_treatment_start_date,
          treatment_end_date,
          other_treatment_dose,
          other_primaquine,
          other_outcome,
          other_outcome_date,
          other_remarks,
          created_at,
          updated_at
        FROM notifications 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;

      const searchParams = [...queryParams, parseInt(limit), offset];

      db.query(searchQuery, searchParams, (err, results) => {
        if (err) {
          console.error('❌ Error searching notifications:', err);
          return res.status(500).json({ 
            success: false,
            error: 'Failed to search notifications',
            details: err.message 
          });
        }

        console.log(`✅ Found ${results.length} notifications matching search criteria`);

        // Transform data for frontend - KEEP ALL FIELDS
        const transformedResults = results.map(notification => ({
          id: notification.id,
          patient_id: notification.patient_id,
          first_name: notification.first_name,
          second_name: notification.second_name,
          institution: notification.institution,
          governorate: notification.governorate,
          wilayat: notification.wilayat,
          treatment: notification.treatment,
          outcome: notification.outcome,
          age: notification.age,
          gender: notification.gender,
          mobile_no: notification.mobile_no,
          place_of_work: notification.place_of_work,
          reporting_date: notification.reporting_date,
          dob: notification.dob,
          expiry_date: notification.expiry_date,
          term: notification.term,
          next_of_kin_mobile_no: notification.next_of_kin_mobile_no,
          education: notification.education,
          passport_no: notification.passport_no,
          monthly_income: notification.monthly_income,
          patient_governorate: notification.patient_governorate,
          nationality: notification.nationality,
          longitude: notification.longitude,
          marital_status: notification.marital_status,
          patient_wilayat: notification.patient_wilayat,
          work_status: notification.work_status,
          treatment_start_date: notification.treatment_start_date,
          treatment_dose: notification.treatment_dose,
          primaquine: notification.primaquine,
          outcome_date: notification.outcome_date,
          remarks: notification.remarks,
          date_of_onset: notification.date_of_onset,
          symptoms: notification.symptoms ? notification.symptoms.split(',') : [],
          past_history_of_malaria: notification.past_history_of_malaria,
          blood_transfusion_within_past_3_months: notification.blood_transfusion_within_past_3_months,
          rdt_reported_date: notification.rdt_reported_date,
          species: notification.species ? notification.species.split(',') : [],
          density: notification.density,
          stages: notification.stages ? notification.stages.split(',') : [],
          parasite_count: notification.parasite_count,
          relapse: notification.relapse,
          other_treatment: notification.other_treatment,
          other_treatment_start_date: notification.other_treatment_start_date,
          treatment_end_date: notification.treatment_end_date,
          other_treatment_dose: notification.other_treatment_dose,
          other_primaquine: notification.other_primaquine,
          other_outcome: notification.other_outcome,
          other_outcome_date: notification.other_outcome_date,
          other_remarks: notification.other_remarks,
          created_at: notification.created_at,
          updated_at: notification.updated_at,
          // Also include the display fields for the table
          notificationId: notification.id,
          patientName: `${notification.first_name} ${notification.second_name || ''}`.trim(),
          patientNo: notification.patient_id,
          sex: notification.gender,
          reportingInstitute: notification.institution,
          status: notification.outcome || 'Pending',
          reportingDate: notification.reporting_date ? new Date(notification.reporting_date).toISOString().split('T')[0] : ''
        }));

        res.json({
          success: true,
          notifications: transformedResults,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(countResult[0].total / limit),
            totalItems: countResult[0].total,
            itemsPerPage: parseInt(limit)
          },
          searchType: Object.keys(req.query).length === 2 && patientId ? 'basic' : 'advanced'
        });
      });
    });

  } catch (error) {
    console.error('❌ Unexpected error in search route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});
// GET - Get single notification by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  const query = 'SELECT * FROM notifications WHERE id = ?';
  
  db.query(query, [id], (err, notifications) => {
    if (err) {
      console.error('Error fetching notification:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch notification',
        details: err.message 
      });
    }

    if (notifications.length === 0) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    const notification = notifications[0];

    // Parse JSON fields
    if (notification.symptoms) {
      try {
        notification.symptoms = JSON.parse(notification.symptoms);
      } catch (e) {
        notification.symptoms = [];
      }
    }
    if (notification.species) {
      try {
        notification.species = JSON.parse(notification.species);
      } catch (e) {
        notification.species = [];
      }
    }
    if (notification.stages) {
      try {
        notification.stages = JSON.parse(notification.stages);
      } catch (e) {
        notification.stages = [];
      }
    }

    res.json(notification);
  });
});

// GET - Export all notifications (without pagination)
router.get('/export/all', authenticateToken, (req, res) => {
  try {
    console.log('📊 Export all endpoint called');
    
    const query = `
      SELECT 
        id,
        patient_id,
        civil_id,
        first_name,
        second_name,
        institution,
        governorate,
        wilayat,
        treatment,
        outcome,
        age,
        gender,
        mobile_no,
        place_of_work,
        reporting_date,
        dob,
        expiry_date,
        term,
        next_of_kin_mobile_no,
        education,
        passport_no,
        monthly_income,
        patient_governorate,
        nationality,
        longitude,
        marital_status,
        patient_wilayat,
        work_status,
        treatment_start_date,
        treatment_dose,
        primaquine,
        outcome_date,
        remarks,
        date_of_onset,
        symptoms,
        past_history_of_malaria,
        blood_transfusion_within_past_3_months,
        rdt_reported_date,
        species,
        density,
        stages,
        parasite_count,
        relapse,
        other_treatment,
        other_treatment_start_date,
        treatment_end_date,
        other_treatment_dose,
        other_primaquine,
        other_outcome,
        other_outcome_date,
        other_remarks,
        created_at,
        updated_at
      FROM notifications 
      ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('❌ Error exporting all notifications:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to export notifications',
          details: err.message 
        });
      }

      console.log(`✅ Exporting ${results.length} notifications`);

      // Transform data for export
      const exportData = results.map(notification => ({
        id: notification.id,
        patient_id: notification.patient_id,
        first_name: notification.first_name,
        second_name: notification.second_name,
        institution: notification.institution,
        governorate: notification.governorate,
        wilayat: notification.wilayat,
        treatment: notification.treatment,
        outcome: notification.outcome,
        age: notification.age,
        gender: notification.gender,
        mobile_no: notification.mobile_no,
        place_of_work: notification.place_of_work,
        reporting_date: notification.reporting_date,
        dob: notification.dob,
        expiry_date: notification.expiry_date,
        term: notification.term,
        next_of_kin_mobile_no: notification.next_of_kin_mobile_no,
        education: notification.education,
        passport_no: notification.passport_no,
        monthly_income: notification.monthly_income,
        patient_governorate: notification.patient_governorate,
        nationality: notification.nationality,
        longitude: notification.longitude,
        marital_status: notification.marital_status,
        patient_wilayat: notification.patient_wilayat,
        work_status: notification.work_status,
        treatment_start_date: notification.treatment_start_date,
        treatment_dose: notification.treatment_dose,
        primaquine: notification.primaquine,
        outcome_date: notification.outcome_date,
        remarks: notification.remarks,
        date_of_onset: notification.date_of_onset,
        symptoms: notification.symptoms ? notification.symptoms.split(',') : [],
        past_history_of_malaria: notification.past_history_of_malaria,
        blood_transfusion_within_past_3_months: notification.blood_transfusion_within_past_3_months,
        rdt_reported_date: notification.rdt_reported_date,
        species: notification.species ? notification.species.split(',') : [],
        density: notification.density,
        stages: notification.stages ? notification.stages.split(',') : [],
        parasite_count: notification.parasite_count,
        relapse: notification.relapse,
        other_treatment: notification.other_treatment,
        other_treatment_start_date: notification.other_treatment_start_date,
        treatment_end_date: notification.treatment_end_date,
        other_treatment_dose: notification.other_treatment_dose,
        other_primaquine: notification.other_primaquine,
        other_outcome: notification.other_outcome,
        other_outcome_date: notification.other_outcome_date,
        other_remarks: notification.other_remarks,
        created_at: notification.created_at,
        updated_at: notification.updated_at
      }));

      res.json({
        success: true,
        notifications: exportData,
        total: exportData.length
      });
    });

  } catch (error) {
    console.error('❌ Unexpected error in export route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});


export default router;