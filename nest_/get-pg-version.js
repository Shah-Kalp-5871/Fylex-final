const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL Version:', result[0].version);
  } catch (e) {
    console.error('Error fetching version:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
