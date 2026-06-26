
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const videoSettings = [
    // Home Hero
    { key: 'home_hero_video_title', value: 'The Fylex', label: 'Home Hero Title', description: 'Main title over the hero video', group: 'video' },
    { key: 'home_hero_video_subtitle', value: 'A Legacy of Precision', label: 'Home Hero Subtitle', description: 'Subtext under the hero title', group: 'video' },
    
    // Home Legacy
    { key: 'home_legacy_video_title', value: 'Beyond Generations', label: 'Home Legacy Title', description: 'Title over the legacy video section', group: 'video' },
    { key: 'home_legacy_video_subtitle', value: 'A Fylex is not owned — it is entrusted.', label: 'Home Legacy Subtitle', description: 'Subtext for the legacy section', group: 'video' },
    
    // Shop Hero
    { key: 'shop_hero_video_title', value: 'Master Your Time', label: 'Shop Hero Title', description: 'Title for the shop hero section', group: 'video' },
    { key: 'shop_hero_video_subtitle', value: 'Explore the full collection of masterfully crafted timepieces.', label: 'Shop Hero Subtitle', description: 'Subtext for shop hero', group: 'video' },
    
    // Shop DeepSea
    { key: 'shop_deepsea_video_title', value: 'DeepSea Master', label: 'Shop DeepSea Title', description: 'Title for the DeepSea video section', group: 'video' },
    { key: 'shop_deepsea_video_subtitle', value: 'Engineered for the extreme depths.', label: 'Shop DeepSea Subtitle', description: 'Subtext for DeepSea section', group: 'video' },
    
    // Shop Precision
    { key: 'shop_precision_video_title', value: 'Art of Precision', label: 'Shop Precision Title', description: 'Title for the Precision video section', group: 'video' },
    { key: 'shop_precision_video_subtitle', value: 'Where engineering meets high horology.', label: 'Shop Precision Subtitle', description: 'Subtext for Precision section', group: 'video' },
    
    // Products Hero
    { key: 'products_hero_video_title', value: 'The Collection', label: 'Products Hero Title', description: 'Title for the products listing page', group: 'video' },
    { key: 'products_hero_video_subtitle', value: 'Discover our complete range of artisanal watches.', label: 'Products Hero Subtitle', description: 'Subtext for products page', group: 'video' },
  ];

  console.log('Seeding video text settings...');

  for (const setting of videoSettings) {
    await prisma.setting.upsert({
      where: { 
        group_key: {
          group: setting.group,
          key: setting.key
        }
      },
      update: {
        label: setting.label,
        description: setting.description,
        group: setting.group,
      },
      create: setting,
    });
    console.log(`Upserted: ${setting.key}`);
  }

  console.log('Video text settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
