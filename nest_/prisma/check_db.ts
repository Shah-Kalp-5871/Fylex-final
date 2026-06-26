import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: { variants: true }
      }
    }
  });
  console.log(JSON.stringify({ 
    count, 
    products: products.map(p => ({
      id: p.id.toString(),
      name: p.name,
      status: p.status,
      variantsCount: p._count.variants,
      hasImages: !!p.images,
      heroImage: p.heroImage
    }))
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

