import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  await prisma.$executeRawUnsafe('SELECT setval(\'"specification_groups_id_seq"\', COALESCE((SELECT MAX(id) FROM "specification_groups"), 1) + 1);');
  await prisma.$executeRawUnsafe('SELECT setval(\'"specifications_id_seq"\', COALESCE((SELECT MAX(id) FROM "specifications"), 1) + 1);');
  console.log('Sequence fixed');
}
fix().catch(console.error).finally(() => prisma.$disconnect());
