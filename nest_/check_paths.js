const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    take: 3,
    select: {
      name: true,
      heroImage: true,
      images: true,
      productMedia: {
        include: {
          media: true
        }
      },
      variants: {
        include: {
          variantImages: {
            include: {
              media: true
            }
          }
        }
      }
    }
  });
  console.log(JSON.stringify(products, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
