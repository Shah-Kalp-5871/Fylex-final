const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.customer.findMany({ take: 5 });
  console.log('Customers:', JSON.stringify(users, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  
  const carts = await prisma.cart.findMany({ include: { items: true } });
  console.log('Carts:', JSON.stringify(carts, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

  const orders = await prisma.order.findMany();
  console.log('Orders Count:', orders.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
