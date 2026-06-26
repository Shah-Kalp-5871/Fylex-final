
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.setting.findMany({
    where: { group: 'video' },
    orderBy: { key: 'asc' }
  });
  
  const serialized = settings.map(s => ({
    ...s,
    id: s.id.toString()
  }));

  console.log(JSON.stringify(serialized, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
