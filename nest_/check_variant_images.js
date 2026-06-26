const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const variants = await prisma.productVariant.findMany({
    where: { productId: 20 },
    include: {
      variantImages: {
        include: { media: true }
      },
      variantAttributes: {
        include: {
          attributeValue: {
            include: { attribute: true }
          }
        }
      }
    }
  });
  
  variants.forEach(v => {
    console.log(`Variant ID: ${v.id}, SKU: ${v.sku}`);
    v.variantAttributes.forEach(va => {
      console.log(`  Attribute: ${va.attributeValue.attribute.name}, Value: ${va.attributeValue.label}`);
    });
    v.variantImages.forEach(vi => {
      console.log(`  Image: ${vi.media.fileName}, Type: ${vi.type}, Path: ${vi.media.filePath}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
