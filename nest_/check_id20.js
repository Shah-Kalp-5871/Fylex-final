const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 20 },
    include: {
      productMedia: { include: { media: true } },
      variants: {
        include: {
          variantImages: { include: { media: true } }
        }
      }
    }
  });
  console.log(JSON.stringify(product, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
