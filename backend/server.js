const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/database');
const rideRoutes = require('./routes/rideRoutes');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const mapboxRoutes = require('./routes/mapboxRoutes');
const setupSocketHandlers = require('./sockets/rideSocket');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Happiness Campaign API is running',
    timestamp: new Date()
  });
});

// Tiny ping route for cron-job.org
app.get('/ping', (req, res) => res.send('OK'));

// API Routes
app.use('/api/rides', rideRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mapbox', mapboxRoutes);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    server.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║     HAPPINESS CAMPAIGN - BACKEND SERVER      ║');
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`🗄️  Database: Connected`);
      console.log('');
      console.log('✨ Ready to spread happiness!');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Start the server
startServer();

module.exports = { app, server, io };
