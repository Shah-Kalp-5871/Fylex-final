import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Unified Database Seeding...');

  // 1. Create Admins
  const adminPassword = 'fylex@123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: 'admin@fylex.com' },
    update: { password: hashedPassword, name: 'Fylex Admin', status: 1 },
    create: { name: 'Fylex Admin', email: 'admin@fylex.com', password: hashedPassword, role: 'admin', status: 1 },
  });

  const admin2Password = 'fylex@123';
  const admin2HashedPassword = await bcrypt.hash(admin2Password, 10);
  await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: { password: admin2HashedPassword, name: 'Primary Admin', status: 1 },
    create: { name: 'Primary Admin', email: 'admin@gmail.com', password: admin2HashedPassword, role: 'admin', status: 1 },
  });
  console.log('✅ Administrative accounts initialized.');

  // 2. Relational Product Seeding (Atlas Legacy)
  console.log('🚀 Seeding ATLAS LEGACY Collection...');

  const category = await prisma.category.upsert({
    where: { slug: 'luxury-watches' },
    update: {},
    create: { name: 'Luxury Watches', slug: 'luxury-watches', status: 1, featured: 1 },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: 'fylex-brand' },
    update: {},
    create: { name: 'Fylex Official', slug: 'fylex-brand', isActive: true, isFeatured: 1 },
  });

  // Attributes: Material & Color
  const materialAttr = await prisma.attribute.upsert({
    where: { code: 'attr_material' },
    update: {},
    create: {
      name: 'Material',
      code: 'attr_material',
      type: 'select',
      isVariant: true,
      values: {
        create: [
          { label: 'Gold', value: 'gold', code: 'MAT_GOLD' },
          { label: 'Steel', value: 'steel', code: 'MAT_STEEL' },
        ]
      }
    },
    include: { values: true }
  });

  const colorAttr = await prisma.attribute.upsert({
    where: { code: 'attr_color' },
    update: {},
    create: {
      name: 'Color',
      code: 'attr_color',
      type: 'select',
      isVariant: true,
      values: {
        create: [
          { label: 'Lock', value: 'lock', code: 'COL_LOCK' },
          { label: 'Silver', value: 'silver', code: 'COL_SILVER' },
          { label: 'Blue', value: 'blue', code: 'COL_BLUE' },
          { label: 'Black', value: 'black', code: 'COL_BLACK' },
          { label: 'Aqua', value: 'aqua', code: 'COL_AQUA' },
          { label: 'Beige', value: 'beige', code: 'COL_BEIGE' },
          { label: 'Mint', value: 'mint', code: 'COL_MINT' },
          { label: 'Sky Blue', value: 'sky-blue', code: 'COL_SKY' },
        ]
      }
    },
    include: { values: true }
  });

  await prisma.categoryAttribute.upsert({
    where: { categoryId_attributeId: { categoryId: category.id, attributeId: materialAttr.id } },
    update: {},
    create: { categoryId: category.id, attributeId: materialAttr.id }
  });

  await prisma.categoryAttribute.upsert({
    where: { categoryId_attributeId: { categoryId: category.id, attributeId: colorAttr.id } },
    update: {},
    create: { categoryId: category.id, attributeId: colorAttr.id }
  });

  // Specifications
  const techGroup = await prisma.specificationGroup.create({ data: { name: 'Technical Details' } });
  const specs = await Promise.all([
    prisma.specification.create({ data: { name: 'Movement', code: 'spec_move' } }),
    prisma.specification.create({ data: { name: 'Water Resistance', code: 'spec_water' } }),
    prisma.specification.create({ data: { name: 'Power Reserve', code: 'spec_power' } }),
  ]);

  await prisma.categorySpecGroup.create({ data: { categoryId: category.id, specificationGroupId: techGroup.id } });
  await prisma.specGroupSpec.createMany({
    data: specs.map(s => ({ specificationGroupId: techGroup.id, specificationId: s.id }))
  });

  const products = [
    {
      name: 'Atlas Legacy 01', slug: 'atlas-legacy-01', sku: 'ATLAS-01', theme: 'champagne', bgColor: '#f8f6f1',
      heroImage: '/assets/fylex-watch-v2/premium.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '100 metres / 330 feet' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-01-GOLD-LOCK', material: 'Gold', color: 'Lock', img: 'premium.png' },
        { sku: 'V-01-GOLD-SILVER', material: 'Gold', color: 'Silver', img: 'premium.png' },
        { sku: 'V-01-STEEL-BLUE', material: 'Steel', color: 'Blue', img: 'goldwatch.png' },
      ]
    },
    {
      name: 'Atlas Legacy 02', slug: 'atlas-legacy-02', sku: 'ATLAS-02', theme: 'mist-blue', bgColor: '#e8eef5',
      heroImage: '/assets/fylex-watch-v2/goldwatch.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '300 metres' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-02-STEEL-AQUA', material: 'Steel', color: 'Aqua', img: 'goldwatch.png' },
      ]
    }
  ];

  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name, slug: p.slug, sku: p.sku, productType: 'configurable', status: 'active', isFeatured: true,
        theme: p.theme, bgColor: p.bgColor, heroImage: p.heroImage,
        mainCategoryId: category.id, brandId: brand.id,
        price: 25000, sellingPrice: 25000, qty: 100,
        specifications: { create: p.watchSpecs.map(s => ({ specificationId: s.id, value: s.value })) }
      }
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: created.id, sku: v.sku, price: 25000, sellingPrice: 25000, qty: 50,
          isActive: true, isDefault: p.variants.indexOf(v) === 0,
        }
      });
      const matVal = materialAttr.values.find(val => val.label === v.material);
      if (matVal) await prisma.variantAttribute.create({ data: { variantId: variant.id, attributeId: materialAttr.id, attributeValueId: matVal.id } });
      const colVal = colorAttr.values.find(val => val.label === v.color);
      if (colVal) await prisma.variantAttribute.create({ data: { variantId: variant.id, attributeId: colorAttr.id, attributeValueId: colVal.id } });
      
           if (v.img) {
        // 1. Create the Media record separately
        const media = await prisma.media.create({
          data: { 
            fileName: v.img, 
            originalFilename: v.img, 
            mimeType: 'image/png', 
            extension: 'png', 
            fileSize: 0, 
            disk: 'public' 
          }
        });

        // 2. Now create the VariantImage using the ID from above
        await prisma.variantImage.create({
          data: {
            variantId: variant.id,
            mediaId: media.id, 
            type: 'MAIN', 
            isPrimary: 1
          }
        });
      }

    }
  }

  console.log('✨ Unified seeding completed successfully!');
}

main().catch(e => { console.error('❌ Seeding failed:', e); process.exit(1); }).finally(() => prisma.$disconnect());

