import Notification from '../models/Notification.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/notifications';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

export const createNotification = async (req, res) => {
  try {
    const notificationData = req.body;
    
    // Add user information
    notificationData.createdBy = req.user.userId;
    
    // Validate required fields
    const requiredFields = ['institution', 'patientId', 'firstName', 'dob', 'placeOfWork', 'patientGovernorate', 'nationality', 'patientWilayat', 'gender'];
    const missingFields = requiredFields.filter(field => !notificationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    const result = await Notification.create(notificationData);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        id: result.id,
        notificationId: result.notificationId
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create notification',
      details: error.message 
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, governorate } = req.query;
    
    let searchParams = {};
    if (search) searchParams.search = search;
    if (status) searchParams.status = status;
    if (governorate) searchParams.governorate = governorate;
    
    const notifications = await Notification.search(searchParams);
    
    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = notifications.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(notifications.length / limit),
        totalRecords: notifications.length,
        hasNext: endIndex < notifications.length,
        hasPrev: startIndex > 0
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notification' 
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Add update tracking
    updateData.updatedBy = req.user.userId;
    updateData.updatedAt = new Date();
    
    const success = await Notification.update(id, updateData);
    
    if (!success) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Notification updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update notification' 
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await Notification.delete(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete notification' 
    });
  }
};

export const searchNotifications = async (req, res) => {
  try {
    const searchParams = req.query;
    const notifications = await Notification.search(searchParams);
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error searching notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to search notifications' 
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const stats = await Notification.getStatistics();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics' 
    });
  }
};

export const uploadAttachments = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No files uploaded' 
      });
    }
    
    // Save file information to database
    const attachments = files.map(file => ({
      notification_id: id,
      file_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      file_type: file.mimetype
    }));
    
    // Here you would save attachments to notification_attachments table
    // Implementation depends on your database setup
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: attachments
    });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload attachments' 
    });
  }
};