import app from './app.js';
import { env, isSupabaseConfigured } from './config/env.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SAARTHI Paint-Shop Management Backend Server Ready`);
  console.log(`  Mode:     ${env.NODE_ENV}`);
  console.log(`  Port:     ${PORT}`);
  console.log(`  URL:      http://localhost:${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/api/health`);
  console.log(`  Database: ${isSupabaseConfigured ? 'Supabase PostgreSQL (Connected)' : 'Local Transactional Engine (Active)'}`);
  console.log(`=======================================================`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Received termination signal. Closing server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
