import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
dotenv.config();

import './config/db.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import vaccinationRoutes from './routes/vaccination.js';
import tbRoutes from './routes/TB/tbRoutes.js';
import hevRoutes from './routes/hevRoutes.js';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'https://accuhealth.netlify.app',],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/tb', tbRoutes);
app.use('/api/hev-notifications', hevRoutes);

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
}));

//health
app.use('/api/health', (req, res) => {
  res.json({ message: 'Health check passed' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

