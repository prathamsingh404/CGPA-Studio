// CGPA Studio — Full-Stack Express Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import { connectDB, getDBStatus } from './backend/config/database.js';
import authRoutes from './backend/routes/auth.routes.js';
import academicPlanRoutes from './backend/routes/academicPlan.routes.js';
import { notFound, errorHandler } from './backend/middleware/error.middleware.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser and cookie parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CGPA Studio API is running',
    database: getDBStatus()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', academicPlanRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

// Start Express server after MongoDB connection
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 CGPA Studio Full-Stack Server is running!`);
      console.log(`   Web App & API: http://localhost:${PORT}`);
      console.log(`   Health Check:  http://localhost:${PORT}/api/health`);
      console.log(`   Environment:   ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error(`\n❌ Failed to start server due to database connection error:`);
    console.error(error.message);
    console.error(`\nPlease configure a valid MONGODB_URI in your .env file to run the server.\n`);
    process.exit(1);
  }
}

// Only start server listener if executed directly (e.g. node server.js)
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule && process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
export default app;
