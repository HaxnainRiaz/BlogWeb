import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('📦 MongoDB already connected');
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection timeout settings - reduced for faster feedback
      serverSelectionTimeoutMS: 3000,      // Reduced from 5000
      socketTimeoutMS: 30000,               // Reduced from 45000
      connectTimeoutMS: 5000,               // Reduced from 10000
      // Connection pooling for better performance
      maxPoolSize: 5,                       // Reduced from 10 for stability
      minPoolSize: 1,
      // Retry settings for stability
      retryWrites: true,
      retryReads: true,
      maxStalenessSeconds: 120,
      // Heartbeat settings to maintain connection
      serverMonitoringMode: 'auto',
      heartbeatFrequencyMS: 10000,
      // Disable timeouts on operations
      bufferCommands: true,
      bufferMaxentries: 0,  // Buffer indefinitely until connected
      family: 4,            // Use IPv4
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connection pool size: ${mongoose.connection.getClient().topology.s.pool.totalConnectionCount}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('⚠️  Please check your MONGO_URI in the .env file');
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log('🔄 Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
  isConnected = false;
});

connectDB();
export { connectDB, isConnected };
export default mongoose;

