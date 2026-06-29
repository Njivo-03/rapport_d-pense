import '../config/env.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const prismaModule = require('../generated/prisma/index.js');
const { PrismaClient } = prismaModule;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export { PrismaClient };
export const prisma = new PrismaClient({ adapter });
