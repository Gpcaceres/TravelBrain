require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3005,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:5173', 'http://localhost:8000', 'http://localhost:3004'],
  appTimezone: process.env.APP_TIMEZONE || 'America/Guayaquil'
};
