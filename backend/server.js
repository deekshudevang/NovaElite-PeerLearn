require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const subjectRoutes = require('./routes/subjects');
const courseRoutes = require('./routes/courses');
const aiRoutes = require('./routes/ai');
const tutoringRoutes = require('./routes/tutoring');
const chatRoutes = require('./routes/chat');
const reviewRoutes = require('./routes/reviews');

// Configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edulink';

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173'], 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tutoring-requests', tutoringRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      details: Object.values(error.errors).map(e => e.message) 
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Seed initial data if needed
    await require('./models/seeder')();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PeerLearn API Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Frontend should connect to: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();