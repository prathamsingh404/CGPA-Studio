// Database Configuration & Mongoose Connection
import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB Atlas using Mongoose.
 * If MONGODB_URI is provided in .env, connects to your cloud MongoDB Atlas cluster.
 * If MONGODB_URI is not configured, automatically launches an in-memory database
 * so the application and all CRUD APIs work out of the box for immediate demonstration.
 */
export async function connectDB() {
  let uri = process.env.MONGODB_URI;

  const isPlaceholder = !uri || uri.trim() === '' || uri === 'your_mongodb_atlas_connection_string';

  if (isPlaceholder) {
    console.log('\n[MongoDB] ℹ️  Notice: No MongoDB Atlas URI configured in .env');
    console.log('[MongoDB] 🚀 Initializing automated local database engine for immediate demonstration...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log('[MongoDB] ✅ Automated database engine started.');
    } catch (err) {
      throw new Error(
        'Could not start automated local database and MONGODB_URI is missing.\n' +
        'Please open .env and set MONGODB_URI to your MongoDB Atlas connection string.\n' +
        'Example: mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/cgpa-studio?retryWrites=true&w=majority'
      );
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    const isCloud = uri.startsWith('mongodb+srv://') || uri.includes('mongodb.net');
    const targetLabel = isCloud ? 'MongoDB Atlas Cloud Cluster' : 'Local / Automated Engine';
    console.log(`[MongoDB] ✅ Successfully connected to ${targetLabel} (Database: ${conn.connection.name || 'cgpa-studio'})\n`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] ❌ Connection error: ${error.message}`);
    throw error;
  }
}

/**
 * Helper to check current database connection state.
 * Returns 'connected', 'connecting', 'disconnecting', or 'disconnected'.
 */
export function getDBStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'disconnected';
}

/**
 * Close database connection (used during graceful shutdown or tests)
 */
export async function closeDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
