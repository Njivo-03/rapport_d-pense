import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du processus de seed...');

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔍 Vérification de l\'utilisateur test@test.com...');

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {
      isActive: true,
      passwordHash: hashedPassword,
    },
    create: {
      email: 'test@test.com',
      passwordHash: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'EMPLOYEE',
      isActive: true,
    },
  });

  console.log('✅ Utilisateur prêt !');
  console.log('📧 Email: test@test.com');
  console.log('🔑 Mot de passe: password123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });