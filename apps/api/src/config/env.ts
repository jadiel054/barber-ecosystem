import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-jwt-key',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};
