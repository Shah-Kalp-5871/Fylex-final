const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { id: 20 },
    include: {
      productMedia: {
        include: { media: true }
      },
      variants: {
        include: {
          variantImages: {
            include: { media: true }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(products, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
