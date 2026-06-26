const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.orderItem.findMany().then(items => {
    console.log(items);
    prisma.$disconnect();
});
