const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5
  });
  console.log('Users in database:');
  users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
