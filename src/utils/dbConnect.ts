import mongoose from 'mongoose';

// Get MongoDB connection string from environment variables or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afp_personnel_db';

// Define the type for the cached connection
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare a global variable to cache the database connection
declare global {
  var mongoose: MongooseConnection;
}

// Initialize the global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB database
 */
export async function dbConnect() {
  // If we already have a connection, return it
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // If a connection is being established, wait for it
  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create a new connection promise
    global.mongoose.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  // Wait for the connection to be established
  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
}

// Export the mongoose instance for use in models
export default mongoose; 