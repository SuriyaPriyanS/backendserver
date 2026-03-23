import mongoose from 'mongoose';

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-dashboard';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Wait up to 10 seconds to select a server
      socketTimeoutMS: 45000, // Socket timeout after 45 seconds
      connectTimeoutMS: 10000, // Connection timeout after 10 seconds
      maxPoolSize: 10, // Maximum connection pool size
      minPoolSize: 2, // Minimum connection pool size
      retryWrites: true,
      w: 'majority',
      maxAttempts: 3,
      waitQueueTimeoutMS: 10000 // Time to wait for connection from pool
    });
    
    console.log("✅ MongoDB Connected");
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Connection string:", process.env.MONGODB_URI || 'mongodb://localhost:27017/wellness-dashboard');
    throw error; // Re-throw to handle in server.js
  }
};

export default connectDatabase;

