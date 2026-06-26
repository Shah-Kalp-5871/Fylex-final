const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.setting.findFirst({
    where: { key: 'founder_message' }
  });

  if (!existing) {
    await prisma.setting.create({
      data: {
        key: 'founder_message',
        value: 'At FYLEX, we believe a watch is more than just a timepiece—it\'s a statement of character, a legacy passed down through generations. Our journey began with a simple vision: to craft watches that combine uncompromising quality with timeless design. Every detail is meticulously chosen to ensure that when you wear a FYLEX, you wear a piece of history.',
        group: 'shop_page',
        label: 'founder_message'
      }
    });
    console.log('Successfully seeded founder_message setting.');
  } else {
    console.log('founder_message already exists.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
