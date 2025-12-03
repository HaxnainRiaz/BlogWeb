import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

// Build a valid MongoDB URI even if the base URI has no DB name
const buildMongoURI = () => {
  const base = process.env.MONGO_URI;

  if (!base) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  // If the URI already has a path after .net, just return it
  try {
    const url = new URL(base);
    if (url.pathname && url.pathname !== '/' && url.pathname.length > 1) {
      return base;
    }
  } catch {
    // If URL parsing fails (shouldn't for a valid Atlas URI), just fall back to base
    return base;
  }

  // If no db name in path, append one (defaults to "myblog")
  const dbName = process.env.DB_NAME || 'myblog';

  if (base.endsWith('/')) {
    return `${base}${dbName}`;
  }

  const [uriWithoutQuery, query] = base.split('?');
  const withDb = `${uriWithoutQuery}/${dbName}`;
  return query ? `${withDb}?${query}` : withDb;
};

const connectDB = async () => {
  if (isConnected) {
    console.log('📦 MongoDB already connected');
    return;
  }

  try {
    const mongoURI = buildMongoURI();

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`🔗 Using Mongo URI: ${mongoURI.replace(/:\/\/(.*)@/, '://<hidden>@')}`);
    
    await mongoose.connect(mongoURI, {
      // Atlas requires TLS
      ssl: true,
      // Connection timeout settings - slightly higher for Atlas
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      // Connection pooling
      maxPoolSize: 5,
      minPoolSize: 1,
      // Retry settings
      retryWrites: true,
      retryReads: true,
      // Heartbeat & buffering
      heartbeatFrequencyMS: 10000,
      bufferCommands: true,
      family: 4,
      // Explicit dbName in case the URI had none
      dbName: process.env.DB_NAME || 'myblog',
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    if (mongoose.connection.getClient && mongoose.connection.getClient().topology?.s?.pool) {
      console.log(
        `📊 Connection pool size: ${mongoose.connection.getClient().topology.s.pool.totalConnectionCount}`
      );
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error(
      '⚠️  Please check your MONGO_URI / DB_NAME and MongoDB Atlas configuration (IP whitelist, user, password).'
    );
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

