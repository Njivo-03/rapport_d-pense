// src/config/env.js
import { config } from 'dotenv';
config();

console.log('🔑 JWT_SECRET loaded:', !!process.env.JWT_SECRET); // debug

const env = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;