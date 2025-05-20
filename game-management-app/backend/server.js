const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const gamesRouter = require('./routes/games');
const usersRouter = require('./routes/users');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] Response completed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
  });
  next();
});

// CORS configuration 
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Starting MongoDB connection...');
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

// API Routes
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);

// Healthcheck endpoint - DON'T use any URLs in route paths
app.get('/api/healthcheck', (req, res) => {
  try {
    res.status(200).json({ 
      status: 'ok', 
      message: 'Game Management API is running',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in healthcheck endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API 404 handler
app.use((req, res) => {
  console.log(`API endpoint not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});