const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 2 },
    include: { variants: true }
  });
  console.log(`Product ID: ${product?.id}, Type: ${product?.productType}, Variants Count: ${product?.variants?.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
