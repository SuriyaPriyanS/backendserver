import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import connectDatabase from './config/database.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import nutritionRoutes from './routes/nutrition.js';
import activityRoutes from './routes/activities.js';
import sleepRoutes from './routes/sleep.js';
import goalRoutes from './routes/goals.js';
import achievementRoutes from './routes/achievements.js';
import dashboardRoutes from './routes/dashboard.js';

// ✅ Load env FIRST
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(helmet());

app.use(
  morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')
);

app.use(
  cors({
    origin: '*', // 🔥 change in production
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check
app.get('/api/health-check', (req, res) => {
  const dbState = mongoose.connection.readyState;

  const dbStatus =
    dbState === 1
      ? 'connected'
      : dbState === 2
      ? 'connecting'
      : 'disconnected';

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message:
      dbState === 1
        ? 'Server and DB ready'
        : 'DB not connected',
    dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Health & Wellness API Server',
    version: '1.0.0',
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 4001;

// ✅ START SERVER PROPERLY
const startServer = async () => {
  try {
    // ✅ Connect DB FIRST
    // await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
      console.log('✅ MongoDB Connected');
      console.log('='.repeat(60) + '\n');
    });

    return server;
  } catch (err) {
    console.error('❌ Server start failed:', err.message);
    process.exit(1);
  }
};

// Start app
let server;

startServer()
  .then((s) => {
    server = s;
  })
  .catch((err) => {
    console.error('Fatal error:', err);
  });

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  if (server) {
    server.close(() => console.log('✅ Server closed'));
  }
});

export default app;