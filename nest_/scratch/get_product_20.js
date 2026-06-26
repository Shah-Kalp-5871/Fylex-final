const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Please provide a product ID');
    process.exit(1);
  }

  const product = await prisma.product.findUnique({
    where: { id: BigInt(id) },
    include: {
      mainCategory: true,
      brand: true,
      variants: {
        include: {
          variantAttributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true
                }
              }
            }
          }
        }
      },
      specifications: {
        include: {
          specification: true
        }
      }
    }
  });

  if (!product) {
    console.log('Product not found');
  } else {
    // Handle BigInt serialization
    console.log(JSON.stringify(product, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
