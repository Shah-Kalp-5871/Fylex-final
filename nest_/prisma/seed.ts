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

  // Attributes: Steel & Strap
  const materialAttr = await prisma.attribute.upsert({
    where: { code: 'attr_material' },
    update: { name: 'Steel' },
    create: {
      name: 'Steel',
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
    update: { name: 'Strap' },
    create: {
      name: 'Strap',
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

  const techGroup = await prisma.specificationGroup.findFirst({ where: { name: 'Technical Details' } }) 
    || await prisma.specificationGroup.create({ data: { name: 'Technical Details' } });

  const specsData = [
    { name: 'Movement', code: 'spec_move' },
    { name: 'Warranty Information', code: 'spec_warranty' },
    { name: 'Water resistance', code: 'spec_water' },
    { name: 'Case', code: 'spec_case' },
    { name: 'Strap/Belt', code: 'spec_strap' },
    { name: 'Dial', code: 'spec_dial' }
  ];

  const specs: any[] = [];
  for (const s of specsData) {
    const spec = await prisma.specification.upsert({
      where: { code: s.code },
      update: { name: s.name },
      create: { name: s.name, code: s.code }
    });
    specs.push(spec);
  }

  // Safely link category and spec group
  await prisma.categorySpecGroup.upsert({
    where: { categoryId_specificationGroupId: { categoryId: category.id, specificationGroupId: techGroup.id } },
    update: {},
    create: { categoryId: category.id, specificationGroupId: techGroup.id }
  });

  // Safely link specs to group
  for (const s of specs) {
    await prisma.specGroupSpec.upsert({
      where: { specificationGroupId_specificationId: { specificationGroupId: techGroup.id, specificationId: s.id } },
      update: {},
      create: { specificationGroupId: techGroup.id, specificationId: s.id }
    });
  }

  const products = [
    {
      name: 'Atlas Legacy 01', slug: 'atlas-legacy-01', sku: 'ATLAS-01', theme: 'champagne', bgColor: '#f8f6f1',
      heroImage: '/assets/fylex-watch-v2/premium.png',
      watchSpecs: [
        { id: specs.find(s => s.code === 'spec_move')?.id || 0, value: 'Legacy Calibre 3235' },
        { id: specs.find(s => s.code === 'spec_warranty')?.id || 0, value: '5 Years International Warranty' },
        { id: specs.find(s => s.code === 'spec_water')?.id || 0, value: '100 metres / 330 feet' },
        { id: specs.find(s => s.code === 'spec_case')?.id || 0, value: '41mm, 18ct Gold' },
        { id: specs.find(s => s.code === 'spec_strap')?.id || 0, value: 'President, semi-circular three-piece links' },
        { id: specs.find(s => s.code === 'spec_dial')?.id || 0, value: 'Champagne-colour' }
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
        { id: specs.find(s => s.code === 'spec_move')?.id || 0, value: 'Legacy Calibre 3235' },
        { id: specs.find(s => s.code === 'spec_warranty')?.id || 0, value: '5 Years International Warranty' },
        { id: specs.find(s => s.code === 'spec_water')?.id || 0, value: '300 metres / 1000 feet' },
        { id: specs.find(s => s.code === 'spec_case')?.id || 0, value: '42mm, Oystersteel' },
        { id: specs.find(s => s.code === 'spec_strap')?.id || 0, value: 'Oyster, flat three-piece links' },
        { id: specs.find(s => s.code === 'spec_dial')?.id || 0, value: 'Mist Blue' }
      ],
      variants: [
        { sku: 'V-02-STEEL-AQUA', material: 'Steel', color: 'Aqua', img: 'goldwatch.png' },
      ]
    }
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name, sku: p.sku, theme: p.theme, bgColor: p.bgColor, heroImage: p.heroImage,
        price: 25000, sellingPrice: 25000, qty: 100
      },
      create: {
        name: p.name, slug: p.slug, sku: p.sku, productType: 'configurable', status: 'active', isFeatured: true,
        theme: p.theme, bgColor: p.bgColor, heroImage: p.heroImage,
        mainCategoryId: category.id, brandId: brand.id,
        price: 25000, sellingPrice: 25000, qty: 100
      }
    });

    // Handle specifications manually to avoid unique constraint issues
    for (const spec of p.watchSpecs) {
      if (!spec.id) continue;
      const existing = await prisma.productSpecification.findFirst({
        where: { productId: created.id, specificationId: spec.id }
      });
      if (existing) {
        await prisma.productSpecification.update({
          where: { id: existing.id },
          data: { value: spec.value }
        });
      } else {
        await prisma.productSpecification.create({
          data: { productId: created.id, specificationId: spec.id, value: spec.value }
        });
      }
    }

    for (const v of p.variants) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          price: 25000, sellingPrice: 25000, qty: 50,
          isActive: true, isDefault: p.variants.indexOf(v) === 0,
        },
        create: {
          productId: created.id, sku: v.sku, price: 25000, sellingPrice: 25000, qty: 50,
          isActive: true, isDefault: p.variants.indexOf(v) === 0,
        }
      });
      const matVal = materialAttr.values.find(val => val.label === v.material);
      if (matVal) {
        await prisma.variantAttribute.upsert({
          where: { variantId_attributeId: { variantId: variant.id, attributeId: materialAttr.id } },
          update: { attributeValueId: matVal.id },
          create: { variantId: variant.id, attributeId: materialAttr.id, attributeValueId: matVal.id }
        }).catch(() => {}); // Catch existing 
      }
      const colVal = colorAttr.values.find(val => val.label === v.color);
      if (colVal) {
        await prisma.variantAttribute.upsert({
          where: { variantId_attributeId: { variantId: variant.id, attributeId: colorAttr.id } },
          update: { attributeValueId: colVal.id },
          create: { variantId: variant.id, attributeId: colorAttr.id, attributeValueId: colVal.id }
        }).catch(() => {});
      }
      
      if (v.img) {
        // 1. Create the Media record separately
        let media = await prisma.media.findFirst({ where: { fileName: v.img } });
        if (!media) {
          media = await prisma.media.create({
            data: { 
              fileName: v.img, 
              originalFilename: v.img, 
              mimeType: 'image/png', 
              extension: 'png', 
              fileSize: 0, 
              disk: 'public' 
            }
          });
        }

        // 2. Now create the VariantImage using the ID from above
        await prisma.variantImage.findFirst({ where: { variantId: variant.id, mediaId: media.id } })
          || await prisma.variantImage.create({
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

