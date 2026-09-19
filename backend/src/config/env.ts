import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  databaseUrl:
    process.env.DATABASE_URL || 'postgres://diwali:diwali@localhost:5434/diwalifund',
  nodeEnv: process.env.NODE_ENV || 'development',
};
