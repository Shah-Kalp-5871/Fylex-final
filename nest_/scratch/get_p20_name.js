const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findUnique({where: {id: BigInt(20)}});
  if (p) {
    console.log(p.name, p.slug);
  } else {
    console.log("Product not found");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
