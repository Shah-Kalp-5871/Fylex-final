import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.product.count();
  console.log('Product Count:', count);
  const products = await prisma.product.findMany({ select: { name: true, sku: true, theme: true } });
  console.log('Products:', JSON.stringify(products, null, 2));
}
run().finally(() => prisma.$disconnect());

