const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.category.create({
      data: {
        name: 'Test Category ' + Date.now(),
        slug: 'test-category-' + Date.now(),
        status: 1,
      },
    });
    console.log('Category created:', category);
    
    const count = await prisma.category.count();
    console.log('Total categories:', count);
  } catch (error) {
    console.error('Error creating category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
