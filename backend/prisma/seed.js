// 1. Charger le .env pour que Prisma trouve la DATABASE_URL
import 'dotenv/config'; 

// 2. Importer le client depuis ton dossier de génération personnalisé
import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du processus de seed...');

  const password = 'password123'; // Le mot de passe que tu utiliseras
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('🔍 Vérification de l\'utilisateur test@test.com...');

  const user = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {
      // Si l'utilisateur existe déjà, on s'assure qu'il est actif
      isActive: true,
      passwordHash: hashedPassword // On met à jour le mot de passe au cas où
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
  console.log('-------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });