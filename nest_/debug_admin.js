const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('--- Admins in Database ---');
  admins.forEach(admin => {
    console.log(`ID: ${admin.id}, Email: "${admin.email}", Name: "${admin.name}"`);
    console.log(`Hash starts with: ${admin.password.substring(0, 10)}...`);
  });
  process.exit(0);
}

main();
