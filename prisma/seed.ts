import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tecnobrain.com' },
    update: {},
    create: {
      email: 'admin@tecnobrain.com',
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const operatorPasswordHash = await bcrypt.hash('operator123', 10);
  await prisma.user.upsert({
    where: { email: 'operator@tecnobrain.com' },
    update: {},
    create: {
      email: 'operator@tecnobrain.com',
      name: 'Operator User',
      passwordHash: operatorPasswordHash,
      role: 'OPERATOR',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
