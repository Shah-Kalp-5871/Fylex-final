const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.banner.findMany().then(console.log).finally(() => prisma.$disconnect());
