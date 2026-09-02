import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { config } from './config/env';
import { errorHandler } from './middlewares/error';
import { authRouter } from './routes/auth';
import { barbershopRouter } from './routes/barbershops';
import { serviceRouter } from './routes/services';
import { userRouter } from './routes/users';
import { appointmentRouter } from './routes/appointments';
import { adminRouter } from './routes/admin';
import { publicRouter } from './routes/public';

export const app = express();

app.use(helmet());

const configuredOrigins = [
  config.frontendUrl,
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
]
  .filter((url): url is string => Boolean(url))
  .flatMap((url) => url.split(',').map((u) => u.trim()));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, '');
      const isAllowed =
        configuredOrigins.some((allowed) => allowed.replace(/\/$/, '') === cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        config.nodeEnv !== 'production';

      if (isAllowed || !process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  })
);

app.use(cookieParser());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/barbershops', barbershopRouter);
app.use('/api/services', serviceRouter);
app.use('/api/users', userRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 API Server running on port ${config.port}`);
  });
}
