const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { productId: 1 },
    include: {
      variantImages: {
        include: { media: true }
      }
    }
  });
  
  variants.forEach(v => {
    console.log(`Variant ID: ${v.id}, SKU: ${v.sku}`);
    v.variantImages.forEach(vi => {
      console.log(`  Image: ${vi.media.fileName}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
