import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  await connectDB();

  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already occupied by another process.`);
      console.error(`👉 To free port ${PORT} on Windows PowerShell, run:`);
      console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🔍 AI Mystery Room Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });

  // Graceful shutdown on restart or terminate
  const handleExit = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

startServer();
