const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧠 TravelBrain Business Rules API');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🕐 Timezone: ${config.appTimezone}`);
  console.log(`🔐 CORS Origins: ${config.corsOrigins.join(', ')}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Ready to validate and process business rules!`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/`);
  console.log('═══════════════════════════════════════════════════════');
});
