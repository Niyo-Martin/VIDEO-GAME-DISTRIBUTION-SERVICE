// myserver.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const gamesRouter = require('./routes/games');
const usersRouter = require('./routes/users');

//environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  //response completion
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] Response completed: ${req.method} ${req.path} - Status: ${res.statusCode}`);
  });
  
  // Track if request closes without response
  res.on('close', () => {
    if (!res.writableEnded) {
      console.log(`[${new Date().toISOString()}] Connection closed without response: ${req.method} ${req.path}`);
    }
  });
  
  next();
});

//CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// MongoDB Atlas connection 
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Starting MongoDB connection...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
})
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Continue running the app even if DB connection fails
});

// Monitor for MongoDB disconnections
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected - attempting to reconnect');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});

// API Routes - 
app.use('/api/games', gamesRouter);
app.use('/api/users', usersRouter);

// Basic health check endpoint - using a different path to avoid the error
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

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, './frontend/build')));

// API 404 handler for missing API endpoints
app.all('/api/*', (req, res) => {
  console.log(`API endpoint not found: ${req.method} ${req.path}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Catch-all route for React router - MUST come after API routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, './frontend/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend files not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/healthcheck`);
});