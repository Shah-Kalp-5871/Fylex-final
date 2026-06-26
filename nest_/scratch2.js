const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.homeSection.findMany().then(console.log).finally(() => prisma.$disconnect());
