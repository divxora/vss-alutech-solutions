import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'node:path';

import { initDatabase } from './config/db';
import { userModel } from './models/userModel';
import { submissionModel } from './models/submissionModel';
import contactRoutes from './routes/contactRoutes';
import manpowerRoutes from './routes/manpowerRoutes';
import quoteRoutes from './routes/quoteRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Database & seed defaults (never wipes submissions)
initDatabase();
userModel.seedDefaultAdmin();
void submissionModel.restoreFromCloudIfAvailable();

export function createApp(): Express {
  const app = express();

  // Security Headers via Helmet
  // Keep CSP relaxed/disabled for dev/iframe embedding
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Middleware
  app.use(
    cors({
      origin: true, // Allow requesting origin (supports localhost, GitHub Pages, production domain)
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
    })
  );

  // Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'VSS Alutech Solutions Enterprise Backend',
      version: '1.0.0',
      database: 'SQLite',
      timestamp: new Date().toISOString(),
    });
  });

  // API Discovery / Overview Endpoint
  app.get('/api', (_req, res) => {
    res.status(200).json({
      service: 'VSS Alutech Solutions B2B Backend API',
      documentation: '/BACKEND.md',
      endpoints: {
        health: 'GET /api/health',
        contact: 'POST /api/contact',
        manpowerRequest: 'POST /api/manpower-request',
        quoteRequest: 'POST /api/quote-request (supports multipart/form-data with CAD/blueprint upload)',
        adminLogin: 'POST /api/admin/login',
        adminSubmissions: 'GET /api/admin/submissions (Protected: Bearer JWT)',
        adminSubmissionById: 'GET /api/admin/submissions/:id (Protected: Bearer JWT)',
        adminUpdateStatus: 'PATCH /api/admin/submissions/:id/status (Protected: Bearer JWT)',
        adminDelete: 'DELETE /api/admin/submissions/:id (Protected: Bearer JWT)',
        adminDownload: 'GET /api/admin/download/:id (Protected: Bearer JWT)',
      },
    });
  });

  // Mount API Endpoints
  app.use('/api/contact', contactRoutes);
  app.use('/api/manpower-request', manpowerRoutes);
  app.use('/api/quote-request', quoteRoutes);
  app.use('/api/admin', adminRoutes);

  // Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
