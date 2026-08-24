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

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
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

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`🚀 API Server running on port ${config.port}`);
  });
}
