const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const productCount = await prisma.product.count();
    console.log(`Product count: ${productCount}`);
    
    if (productCount > 0) {
      const products = await prisma.product.findMany({ select: { id: true, name: true, slug: true } });
      console.log('Products found:', JSON.stringify(products, (key, value) => i === 'id' ? value.toString() : value, 2));
    }
  } catch (error) {
    console.error('Error checking products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
