const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    take: 5
  });
  console.log('Customers in database:');
  customers.forEach(c => {
    // Handling BigInt for logging
    const sanitized = JSON.parse(JSON.stringify(c, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    console.log(`ID: ${sanitized.id}, Name: ${sanitized.name}, Mobile: ${sanitized.mobile}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
