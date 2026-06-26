import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  const result = await prisma.customer.updateMany({
    where: { createdAt: null },
    data: { createdAt: new Date() }
  });
  console.log(`Fixed ${result.count} users`);
}

fix().catch(e => console.error(e)).finally(() => prisma.$disconnect());
