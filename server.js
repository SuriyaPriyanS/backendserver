import express from 'express';
import dotenv from 'dotenv';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDatabase from './config/database.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';
import nutritionRoutes from './routes/nutrition.js';
import activityRoutes from './routes/activities.js';
import sleepRoutes from './routes/sleep.js';
import goalRoutes from './routes/goals.js';
import achievementRoutes from './routes/achievements.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(cors({
  origin: 
  "*", // Adjust as needed for production
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/api/health-check', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Health & Wellness API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/api/health',
      nutrition: '/api/nutrition',
      activities: '/api/activities',
      sleep: '/api/sleep',
      goals: '/api/goals',
      achievements: '/api/achievements',
      dashboard: '/api/dashboard'
    }
  });
});

// Error handlers
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// Start server
const PORT = process.env.PORT || 4001;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log('='.repeat(60) + '\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default app;
