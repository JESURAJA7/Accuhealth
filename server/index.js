import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import './config/db.js';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import vaccinationRoutes from './routes/vaccination.js';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173','https://'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/vaccination', vaccinationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

