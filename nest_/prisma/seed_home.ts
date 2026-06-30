import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Home Sections for app/page.tsx compatibility...');

  // Delete existing to avoid duplicates
  await prisma.homeSection.deleteMany({});

  const homeSections = [
    { title: 'Hero Video', type: 's1', sortOrder: 1, isActive: true },
    { title: 'Movement Section', type: 's2', sortOrder: 2, isActive: true },
    { title: 'Design Section', type: 's3', sortOrder: 3, isActive: true },
    { title: 'Legacy Video', type: 's4', sortOrder: 4, isActive: true },
    { title: 'Featured Products Grid', type: 'featured', sortOrder: 5, isActive: true },
    { title: 'Atelier Gallery', type: 'gallery', sortOrder: 6, isActive: true },
    { title: 'Excellence Counter', type: 'counter', sortOrder: 7, isActive: true },
  ];

  for (const s of homeSections) {
    await prisma.homeSection.create({
      data: {
        title: s.title,
        type: s.type,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
        content: JSON.stringify({ description: `Section ${s.title}` }),
      },
    });
  }

  console.log('✅ Home Sections seeded.');
  
  // Seed settings for videos
  const settings = [
    { group: 'video', key: 'home_hero_video', value: 'https://vjs.zencdn.net/v/oceans.mp4' },
    { group: 'video', key: 'home_hero_video_title', value: 'FYLEX' },
    { group: 'video', key: 'home_hero_video_subtitle', value: 'Wear Your Choice.' },
    { group: 'video', key: 'home_legacy_video', value: 'https://vjs.zencdn.net/v/oceans.mp4' },
    { group: 'video', key: 'home_legacy_video_title', value: 'Not Everyone Follows <em>The Same Path.</em>' },
    { group: 'video', key: 'home_legacy_video_subtitle', value: 'Different Ambitions. Different Routines. Different Stories.' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { group_key: { group: s.group, key: s.key } },
      update: { value: s.value },
      create: { key: s.key, value: s.value, group: s.group, label: s.key, type: 'text' },
    });
  }

  console.log('✅ Video settings seeded.');
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
