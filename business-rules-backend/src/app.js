const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const businessRulesRoutes = require('./routes/businessRulesRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TravelBrain Business Rules API',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/business-rules', businessRulesRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TravelBrain Business Rules API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      businessRules: '/api/business-rules'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

module.exports = app;
