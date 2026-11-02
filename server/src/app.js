import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { mongoSanitize } from './middleware/mongoSanitize.js';
import { logger } from './utils/logger.js';

const app = express();

// Disable server header
app.disable('x-powered-by');

// Security Headers Middleware
app.use(securityHeaders);

// CORS configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || config.isDevelopment) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

// Body Parsers
// Stripe Webhook requires raw Buffer body for cryptographic signature verification
app.use(
  '/api/v1/payments/webhook',
  express.raw({ type: 'application/json' })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Query Injection Sanitizer
app.use(mongoSanitize);

// Request Logging Middleware (Development & Diagnostics)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'NOVAMART API Server',
    status: 'running',
    version: '1.0.0',
    docs: '/api/v1'
  });
});

// Mount Versioned API Routes
app.use('/api/v1', apiRouter);

// 404 Not Found Middleware
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
