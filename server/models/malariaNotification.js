import db from '../config/db.js';

class Notification {
  static async create(notificationData) {
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
      bloodTransfusionWithinPast3Months,

      // Lab Results
      rdtReportedDate,
      species,
      density,
      stages,
      parasiteCount,
      relapse,

      // Other Details
      otherTreatment,
      otherTreatmentStartDate,
      treatmentEndDate,
      otherTreatmentDose,
      otherPrimaquine,
      otherOutcome,
      otherOutcomeDate,
      otherRemarks
    } = notificationData;

    // Generate unique notification ID
    const notificationId = 'MAL' + Date.now() + Math.floor(Math.random() * 1000);
    
    const query = `
      INSERT INTO malaria_notifications (
        notification_id, governorate, wilayat, institution, reporting_date,
        patient_id, civil_id, expiry_date, age, first_name, second_name, dob, term,
        mobile_no, next_of_kin_mobile_no, education, passport_no, place_of_work,
        monthly_income, patient_governorate, nationality, longitude, marital_status,
        patient_wilayat, gender, work_status, treatment, treatment_start_date,
        treatment_dose, primaquine, outcome, outcome_date, remarks, date_of_onset,
        symptoms, past_history_of_malaria, blood_transfusion_within_past_3_months,
        rdt_reported_date, species, density, stages, parasite_count, relapse,
        other_treatment, other_treatment_start_date, treatment_end_date,
        other_treatment_dose, other_primaquine, other_outcome, other_outcome_date,
        other_remarks, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Saved', NOW())
    `;

    const values = [
      notificationId, governorate, wilayat, institution, reportingDate,
      patientId, civilId, expiryDate, age, firstName, secondName, dob, term,
      mobileNo, nextOfKinMobileNo, education, passportNo, placeOfWork,
      monthlyIncome, patientGovernorate, nationality, longitude, maritalStatus,
      patientWilayat, gender, workStatus, treatment, treatmentStartDate,
      treatmentDose, primaquine, outcome, outcomeDate, remarks, dateOfOnset,
      JSON.stringify(symptoms || []), pastHistoryOfMalaria, bloodTransfusionWithinPast3Months,
      rdtReportedDate, JSON.stringify(species || []), density, JSON.stringify(stages || []),
      parasiteCount, relapse, otherTreatment, otherTreatmentStartDate, treatmentEndDate,
      otherTreatmentDose, otherPrimaquine, otherOutcome, otherOutcomeDate, otherRemarks
    ];

    try {
      const [result] = await db.execute(query, values);
      return {
        id: result.insertId,
        notificationId,
        message: 'Notification created successfully'
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async findAll() {
    const query = `
      SELECT 
        id,
        notification_id as notificationId,
        DATE_FORMAT(reporting_date, '%d/%m/%y') as reportingDate,
        CONCAT(first_name, ' ', COALESCE(second_name, '')) as patientName,
        patient_id as patientNo,
        age,
        gender as sex,
        institution as reportingInstitute,
        status,
        created_at
      FROM malaria_notifications 
      ORDER BY created_at DESC
    `;

    try {
      const [rows] = await db.execute(query);
      return rows;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT * FROM malaria_notifications WHERE id = ?
    `;

    try {
      const [rows] = await db.execute(query, [id]);
      if (rows.length > 0) {
        const notification = rows[0];
        // Parse JSON fields
        if (notification.symptoms) {
          notification.symptoms = JSON.parse(notification.symptoms);
        }
        if (notification.species) {
          notification.species = JSON.parse(notification.species);
        }
        if (notification.stages) {
          notification.stages = JSON.parse(notification.stages);
        }
        return notification;
      }
      return null;
    } catch (error) {
      console.error('Error fetching notification by ID:', error);
      throw error;
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        if (Array.isArray(updateData[key])) {
          values.push(JSON.stringify(updateData[key]));
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `UPDATE malaria_notifications SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

    try {
      const [result] = await db.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = `DELETE FROM malaria_notifications WHERE id = ?`;

    try {
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async search(searchParams) {
    let query = `
      SELECT 
        id,
        notification_id as notificationId,
        DATE_FORMAT(reporting_date, '%d/%m/%y') as reportingDate,
        CONCAT(first_name, ' ', COALESCE(second_name, '')) as patientName,
        patient_id as patientNo,
        age,
        gender as sex,
        institution as reportingInstitute,
        status,
        created_at
      FROM malaria_notifications WHERE 1=1
    `;
    
    const values = [];
    const conditions = [];

    // Add search conditions
    if (searchParams.patientId) {
      conditions.push('patient_id LIKE ?');
      values.push(`%${searchParams.patientId}%`);
    }

    if (searchParams.name) {
      conditions.push('(first_name LIKE ? OR second_name LIKE ?)');
      values.push(`%${searchParams.name}%`, `%${searchParams.name}%`);
    }

    if (searchParams.notificationId) {
      conditions.push('notification_id LIKE ?');
      values.push(`%${searchParams.notificationId}%`);
    }

    if (searchParams.reportingDateFrom) {
      conditions.push('reporting_date >= ?');
      values.push(searchParams.reportingDateFrom);
    }

    if (searchParams.reportingDateTo) {
      conditions.push('reporting_date <= ?');
      values.push(searchParams.reportingDateTo);
    }

    if (searchParams.governorate) {
      conditions.push('governorate = ?');
      values.push(searchParams.governorate);
    }

    if (searchParams.institution) {
      conditions.push('institution LIKE ?');
      values.push(`%${searchParams.institution}%`);
    }

    if (searchParams.gender) {
      conditions.push('gender = ?');
      values.push(searchParams.gender);
    }

    if (searchParams.status) {
      conditions.push('status = ?');
      values.push(searchParams.status);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const [rows] = await db.execute(query, values);
      return rows;
    } catch (error) {
      console.error('Error searching notifications:', error);
      throw error;
    }
  }
}

export default Notification;