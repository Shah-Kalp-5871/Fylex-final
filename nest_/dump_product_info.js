const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 20 },
    select: {
      id: true,
      name: true,
      heroImage: true,
      images: true,
      productMedia: {
        include: { media: true }
      }
    }
  });
  console.log(JSON.stringify(product, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
