import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ATLAS LEGACY Seeding with Material & Color...');

  // 0. Cleanup
  console.log('🧹 Cleaning up existing data...');
  await prisma.variantAttribute.deleteMany({});
  await prisma.variantImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.productTag.deleteMany({});
  await prisma.categorySpecGroup.deleteMany({});
  await prisma.categoryAttribute.deleteMany({});
  await prisma.specGroupSpec.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.specification.deleteMany({});
  await prisma.specificationGroup.deleteMany({});
  await prisma.product.deleteMany({});

  // 1. Create Category & Brand
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

  // 2. Create Attributes: Material & Color
  console.log('🎨 Creating Attributes (Material & Color)...');
  const materialAttr = await prisma.attribute.create({
    data: {
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

  const colorAttr = await prisma.attribute.create({
    data: {
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

  // Link Attributes to Category
  await prisma.categoryAttribute.createMany({
    data: [
      { categoryId: category.id, attributeId: materialAttr.id },
      { categoryId: category.id, attributeId: colorAttr.id },
    ]
  });

  // 3. Create Specifications
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

  const atlasLegacyProducts = [
    {
      name: 'Atlas Legacy 01',
      slug: 'atlas-legacy-01',
      sku: 'ATLAS-01',
      theme: 'champagne',
      bgColor: '#f8f6f1',
      heroImage: '/assets/fylex-watch-v2/premium.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '100 metres / 330 feet' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-01-GOLD-LOCK', material: 'Gold', color: 'Lock', img: '/assets/fylex-watch-v2/premium.png' },
        { sku: 'V-01-GOLD-SILVER', material: 'Gold', color: 'Silver', img: '/assets/fylex-watch-v2/premium.png' },
        { sku: 'V-01-STEEL-BLUE', material: 'Steel', color: 'Blue', img: '/assets/fylex-watch-v2/goldwatch.png' },
        { sku: 'V-01-GOLD-BLACK', material: 'Gold', color: 'Black', img: '/assets/fylex-watch-v2/premium.png' },
      ]
    },
    {
      name: 'Atlas Legacy 02',
      slug: 'atlas-legacy-02',
      sku: 'ATLAS-02',
      theme: 'mist-blue',
      bgColor: '#e8eef5',
      heroImage: '/assets/fylex-watch-v2/goldwatch.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '300 metres / 1,000 feet' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-02-STEEL-AQUA', material: 'Steel', color: 'Aqua', img: '/assets/fylex-watch-v2/goldwatch.png' },
        { sku: 'V-02-STEEL-LOCK', material: 'Steel', color: 'Lock', img: '/assets/fylex-watch-v2/goldwatch.png' },
      ]
    },
    {
      name: 'Atlas Legacy 03',
      slug: 'atlas-legacy-03',
      sku: 'ATLAS-03',
      theme: 'pearl-silver',
      bgColor: '#f5f5f7',
      heroImage: '/assets/fylex-watch-v2/white-gold.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '100 metres' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-03-STEEL-BEIGE', material: 'Steel', color: 'Beige', img: '/assets/fylex-watch-v2/white-gold.png' },
      ]
    },
    {
      name: 'Atlas Legacy 04',
      slug: 'atlas-legacy-04',
      sku: 'ATLAS-04',
      theme: 'soft-green',
      bgColor: '#f0f7f2',
      heroImage: '/assets/fylex-watch-v2/Olive-green-dial.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '100 metres' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-04-STEEL-MINT', material: 'Steel', color: 'Mint', img: '/assets/fylex-watch-v2/Olive-green-dial.png' },
      ]
    },
    {
      name: 'Atlas Legacy 05',
      slug: 'atlas-legacy-05',
      sku: 'ATLAS-05',
      theme: 'rose-burgundy',
      bgColor: '#f9f3f4',
      heroImage: '/assets/fylex-watch-v2/Chocolate-dial.png',
      watchSpecs: [
        { id: specs[0].id, value: 'Legacy Calibre 3235' },
        { id: specs[1].id, value: '100 metres' },
        { id: specs[2].id, value: '70 hours' },
      ],
      variants: [
        { sku: 'V-05-STEEL-SKY-BLUE', material: 'Steel', color: 'Sky Blue', img: '/assets/fylex-watch-v2/Chocolate-dial.png' },
      ]
    }
  ];

  for (const pInfo of atlasLegacyProducts) {
    console.log(`💎 Seeding: ${pInfo.name}`);
    const product = await prisma.product.create({
      data: {
        name: pInfo.name,
        slug: pInfo.slug,
        sku: pInfo.sku,
        productType: 'configurable',
        status: 'active',
        isFeatured: true,
        theme: pInfo.theme,
        bgColor: pInfo.bgColor,
        heroImage: pInfo.heroImage,
        mainCategoryId: category.id,
        brandId: brand.id,
        price: 25000,
        sellingPrice: 25000,
        qty: 100,
        specifications: {
          create: pInfo.watchSpecs.map(s => ({ specificationId: s.id, value: s.value }))
        }
      }
    });

    for (const vInfo of pInfo.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: vInfo.sku,
          price: 25000,
          sellingPrice: 25000,
          qty: 50,
          isActive: true,
          isDefault: pInfo.variants.indexOf(vInfo) === 0,
        }
      });
      
      // Link images to variant
      if (vInfo.img) {
        const fileName = vInfo.img.split('/').pop() || 'image.png';
        const media = await prisma.media.create({
          data: {
            fileName: fileName,
            originalFilename: fileName,
            mimeType: 'image/png',
            extension: 'png',
            fileSize: 0,
            disk: 'public'
          }
        });
        await prisma.variantImage.create({
          data: {
            variantId: variant.id,
            mediaId: media.id,
            type: 'MAIN',
            isPrimary: 1
          }
        });
      }

      // Link Material
      const matVal = materialAttr.values.find(v => v.label === vInfo.material);
      if (matVal) {
        await prisma.variantAttribute.create({
          data: { variantId: variant.id, attributeId: materialAttr.id, attributeValueId: matVal.id }
        });
      }

      // Link Color
      const colVal = colorAttr.values.find(v => v.label === vInfo.color);
      if (colVal) {
        await prisma.variantAttribute.create({
          data: { variantId: variant.id, attributeId: colorAttr.id, attributeValueId: colVal.id }
        });
      }
    }
  }

  console.log('✨ ATLAS LEGACY seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

