import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB, db } from './db/db.js';
import { runSeed } from './db/seed.js';

import authRoutes from './routes/auth.js';
import animalRoutes from './routes/animals.js';
import reportRoutes from './routes/reports.js';
import aiRoutes from './routes/ai.js';
import outbreakRoutes from './routes/outbreaks.js';
import labRoutes from './routes/lab.js';
import vaccinationRoutes from './routes/vaccinations.js';
import alertRoutes from './routes/alerts.js';
import ivrRoutes from './routes/ivr.js';
import weatherRoutes from './routes/weather.js';
import syncRoutes from './routes/sync.js';
import auditRoutes from './routes/audit.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'PashuRakshak Livestock Intelligence API',
    state: 'Maharashtra',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/outbreaks', outbreakRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Production Frontend Static Serving & SPA Fallback
const distDir = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distDir, 'index.html'));
    }
    next();
  });
}

// Auto-seed and start server
async function startServer() {
  try {
    initDB();

    // Check if users exist; if not, auto seed
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial Maharashtra livestock seed...');
      await runSeed();
    }

    app.listen(PORT, () => {
      console.log(`\n=============================================================`);
      console.log(` 🛡️  PashuRakshak API Server Running on port ${PORT}`);
      console.log(` 📍  Govt of Maharashtra Livestock Health Intelligence System`);
      console.log(` 🔗  http://localhost:${PORT}/api/health`);
      console.log(`=============================================================\n`);
    });
  } catch (err) {
    console.error('[Server Start Error]', err);
  }
}

startServer();
