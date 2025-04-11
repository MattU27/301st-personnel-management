import mongoose from 'mongoose';

// MongoDB connection string (should be stored in environment variables in production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/armed_forces_app';

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB with improved error handling
 */
export async function connectDB() {
  // If already connected, return
  if (isConnected) {
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Set strictQuery mode
    mongoose.set('strictQuery', true);
    
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    
    // Connect to MongoDB
    const db = await mongoose.connect(MONGODB_URI);
    
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully:', MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw new Error('Failed to connect to database. Please check your connection string and network.');
  }
} 