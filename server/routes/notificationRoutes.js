import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json([
    {
      id: 1,
      notificationId: '10272325',
      reportingDate: '21/09/21',
      patientName: 'Madhavan',
      patientNo: '18',
      age: 28,
      sex: 'M',
      reportingInstitute: 'u hospital',
      status: 'Saved'
    },
    {
      id: 2,
      notificationId: '10272325',
      reportingDate: '21/09/21',
      patientName: 'Maddy',
      patientNo: '17',
      age: 30,
      sex: 'M',
      reportingInstitute: 'M hospital',
      status: 'Rejected'
    }
  ]);
});

router.post('/', authenticateToken, (req, res) => {
 try {
    const {
      // Notification Info
      governorate,
      wilayat,
      institution,
      reportingDate,
      
      // Patient Info
      patientId,
      civilId,
      expiryDate,
      age,
      firstName,
      secondName,
      dob,
      term,
      mobileNo,
      nextOfKinMobileNo,
      education,
      passportNo,
      placeOfWork,
      monthlyIncome,
      patientGovernorate,
      nationality,
      longitude,
      maritalStatus,
      patientWilayat,
      gender,
      workStatus,
      
      // Source Details
      treatment,
      treatmentStartDate,
      treatmentDose,
      primaquine,
      outcome,
      outcomeDate,
      remarks,
      
      // History Details
      dateOfOnset,
      symptoms,
      pastHistoryOfMalaria,
      bloodTransfusionWithinPast3Months
    } = req.body;

    // Generate notification ID
    const notificationId = 'NOT' + Date.now();
    
    const query = `
      INSERT INTO notifications (
        notification_id, patient_name, patient_no, gsm_no, sex, age, 
        marital_status, nationality, patient_governorate, governorate, 
        wilayat, reporting_institute, final_outcome, reporting_date, 
        final_outcome_date, case_detected_visa, lab_confirmed_case, 
        species, past_malaria_history, travel_history, classification, 
        hospital_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      notificationId,
      `${firstName} ${secondName}`.trim(),
      patientId,
      mobileNo,
      gender,
      parseInt(age) || null,
      maritalStatus,
      nationality,
      patientGovernorate,
      governorate,
      wilayat,
      institution,
      outcome,
      reportingDate,
      outcomeDate,
      false, // case_detected_visa
      true,  // lab_confirmed_case
      'mixed', // species
      pastHistoryOfMalaria === 'Yes',
      false, // travel_history
      'local', // classification
      'moh' // hospital_type
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
      
      res.status(201).json({ 
        message: 'Notification saved successfully',
        notificationId: notificationId
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/entry', authenticateToken, (req, res) => {
  try {
    const {
      // Notification Info
      governorate,
      wilayat,
      institution,
      reportingDate,
      
      // Patient Info
      patientId,
      civilId,
      expiryDate,
      age,
      firstName,
      secondName,
      dob,
      term,
      mobileNo,
      nextOfKinMobileNo,
      education,
      passportNo,
      placeOfWork,
      monthlyIncome,
      patientGovernorate,
      nationality,
      longitude,
      maritalStatus,
      patientWilayat,
      gender,
      workStatus,
      
      // Source Details
      treatment,
      treatmentStartDate,
      treatmentDose,
      primaquine,
      outcome,
      outcomeDate,
      remarks,
      
      // History Details
      dateOfOnset,
      symptoms,
      pastHistoryOfMalaria,
      bloodTransfusionWithinPast3Months
    } = req.body;

    // Generate notification ID
    const notificationId = 'NOT' + Date.now();
    
    const query = `
      INSERT INTO notifications (
        notification_id, patient_name, patient_no, gsm_no, sex, age, 
        marital_status, nationality, patient_governorate, governorate, 
        wilayat, reporting_institute, final_outcome, reporting_date, 
        final_outcome_date, case_detected_visa, lab_confirmed_case, 
        species, past_malaria_history, travel_history, classification, 
        hospital_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      notificationId,
      `${firstName} ${secondName}`.trim(),
      patientId,
      mobileNo,
      gender,
      parseInt(age) || null,
      maritalStatus,
      nationality,
      patientGovernorate,
      governorate,
      wilayat,
      institution,
      outcome,
      reportingDate,
      outcomeDate,
      false, // case_detected_visa
      true,  // lab_confirmed_case
      'mixed', // species
      pastHistoryOfMalaria === 'Yes',
      false, // travel_history
      'local', // classification
      'moh' // hospital_type
    ];
    
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to save notification' });
      }
      
      res.status(201).json({ 
        message: 'Notification saved successfully',
        notificationId: notificationId
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
