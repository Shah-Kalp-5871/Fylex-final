const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find cart for customer 1
  let cart = await prisma.cart.findFirst({
    where: { customerId: 1, status: 'active' }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        customerId: 1,
        status: 'active',
        subtotal: 5000,
        grandTotal: 5000
      }
    });
  }

  // Add an item
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productVariantId: 23,
      quantity: 1,
      unitPrice: 5000,
      total: 5000
    }
  });

  console.log('Added item to customer 1 cart');
}

main().catch(console.error).finally(() => prisma.$disconnect());
