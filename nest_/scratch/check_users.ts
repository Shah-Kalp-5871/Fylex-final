import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.customer.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastLoginAt: true,
    }
  });
  console.log(JSON.stringify(users, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

checkUsers()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
