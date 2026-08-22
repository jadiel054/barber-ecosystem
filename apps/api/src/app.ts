import express, { Express } from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { barbersRouter } from './modules/barbers/barbers.router';
import { servicesRouter } from './modules/services/services.router';
import { appointmentsRouter } from './modules/appointments/appointments.router';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Barber Ecosystem API',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/barbers', barbersRouter);
  app.use('/api/v1/services', servicesRouter);
  app.use('/api/v1/appointments', appointmentsRouter);

  return app;
};
