import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Specifications and Groups...');

  // 1. Create Groups
  const groupTechnical = await prisma.specificationGroup.upsert({
    where: { id: 1 },
    update: { name: 'Technical Details' },
    create: { id: 1, name: 'Technical Details', sortOrder: 1 },
  });

  const groupDisplay = await prisma.specificationGroup.upsert({
    where: { id: 2 },
    update: { name: 'Display & Aesthetics' },
    create: { id: 2, name: 'Display & Aesthetics', sortOrder: 2 },
  });

  const groupPhysical = await prisma.specificationGroup.upsert({
    where: { id: 3 },
    update: { name: 'Physical Dimensions' },
    create: { id: 3, name: 'Physical Dimensions', sortOrder: 3 },
  });

  const groupGeneral = await prisma.specificationGroup.upsert({
    where: { id: 4 },
    update: { name: 'General Information' },
    create: { id: 4, name: 'General Information', sortOrder: 0 },
  });

  console.log('✅ Groups created.');

  // 2. Create Specifications
  const specs = [
    // Technical
    { group: groupTechnical, name: 'Movement', code: 'spec_move', type: 'select', values: ['Automatic', 'Quartz', 'Manual Wind', 'Kinetic'] },
    { group: groupTechnical, name: 'Water Resistance', code: 'spec_water', type: 'text', values: ['30m', '50m', '100m', '200m', '300m'] },
    { group: groupTechnical, name: 'Power Reserve', code: 'spec_power', type: 'text', values: ['40 Hours', '70 Hours', '80 Hours'] },
    { group: groupTechnical, name: 'Calibre', code: 'spec_calibre', type: 'text' },

    // Display
    { group: groupDisplay, name: 'Dial Color', code: 'spec_dial', type: 'select', values: ['Black', 'Blue', 'Silver', 'Champagne', 'White'] },
    { group: groupDisplay, name: 'Crystal', code: 'spec_crystal', type: 'select', values: ['Sapphire', 'Mineral', 'Hesalite'] },
    { group: groupDisplay, name: 'Lume', code: 'spec_lume', type: 'text', values: ['Super-LumiNova', 'Chromalight'] },

    // Physical
    { group: groupPhysical, name: 'Case Diameter', code: 'spec_diam', type: 'text', values: ['36mm', '39mm', '41mm', '42mm'] },
    { group: groupPhysical, name: 'Case Material', code: 'spec_mat', type: 'select', values: ['Oystersteel', '18ct Gold', 'Titanium', 'Platinum'] },
    { group: groupPhysical, name: 'Strap Material', code: 'spec_strap', type: 'select', values: ['Oyster Bracelet', 'Jubilee Bracelet', 'Leather Strap', 'Rubber Strap'] },

    // General
    { group: groupGeneral, name: 'Warranty', code: 'spec_warranty', type: 'text', values: ['2 Years', '5 Years International'] },
    { group: groupGeneral, name: 'Reference Number', code: 'spec_ref', type: 'text' },
  ];

  for (const s of specs) {
    const createdSpec = await prisma.specification.upsert({
      where: { code: s.code },
      update: { name: s.name, type: s.type },
      create: { 
        name: s.name, 
        code: s.code, 
        type: s.type,
        isActive: true,
      },
    });

    // Link to group
    await prisma.specGroupSpec.upsert({
      where: { 
        specificationGroupId_specificationId: { 
          specificationGroupId: s.group.id, 
          specificationId: createdSpec.id 
        } 
      },
      update: {},
      create: { 
        specificationGroupId: s.group.id, 
        specificationId: createdSpec.id 
      },
    });

    // Add values if any
    if (s.values) {
      for (const val of s.values) {
        await prisma.specificationValue.create({
          data: {
            specificationId: createdSpec.id,
            value: val,
            status: 1,
          },
        });
      }
    }
  }

  console.log('✅ Specifications and Values seeded.');
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
