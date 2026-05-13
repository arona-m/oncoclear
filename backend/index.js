require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const cancerRoutes = require('./routes/cancer');
const liveRoutes = require('./routes/live');

const app = express();
const PORT = process.env.PORT || 5000;

//  Middleware 

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

//  Routes 

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/cancer', cancerRoutes);
app.use('/api/live', liveRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error.'
  });
});

//  Database Connection 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(` MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

//  Start Server 

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n Cancer Awareness API Server`);
    console.log(`Running on: http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(`BigQuery Project: ${process.env.BIGQUERY_PROJECT_ID || 'Not configured'}\n`);
  });
});

module.exports = app;
