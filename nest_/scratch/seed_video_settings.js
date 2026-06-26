
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const videoSettings = [
    { group: 'video', key: 'home_hero_video', value: '/assets/Fylexxx.mp4', type: 'text', label: 'Home Page Hero Video', description: 'The main hero video on the homepage.' },
    { group: 'video', key: 'home_legacy_video', value: '/assets/Fylexx.mp4', type: 'text', label: 'Home Page Legacy Section Video', description: 'The video for the legacy/heritage section on the homepage.' },
    { group: 'video', key: 'shop_hero_video', value: '/Watch-iframe-3.mp4', type: 'text', label: 'Shop Page Hero Video', description: 'The hero video on the shop landing page.' },
    { group: 'video', key: 'shop_deepsea_video', value: '/Watch-iframe-2.mp4', type: 'text', label: 'Shop Page Deep Sea Video', description: 'The video for the Deep Sea Chronometry section.' },
    { group: 'video', key: 'shop_precision_video', value: '/Watch_Iframe_1.mp4', type: 'text', label: 'Shop Page Precision Video', description: 'The video for the Art of Precision section.' },
    { group: 'video', key: 'products_hero_video', value: '/assets/Fylex.mp4', type: 'text', label: 'Products Page Hero Video', description: 'The hero video on the products listing page.' },
  ];

  console.log('Seeding video settings...');

  for (const setting of videoSettings) {
    await prisma.setting.upsert({
      where: { group_key: { group: setting.group, key: setting.key } },
      update: { value: setting.value, label: setting.label, description: setting.description },
      create: setting,
    });
    console.log(`Upserted: ${setting.key}`);
  }

  console.log('Video settings seeded successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
