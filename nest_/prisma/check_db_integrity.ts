import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIntegrity() {
  console.log('🔍 Starting Data Integrity Audit...');

  const products = await prisma.product.findMany({
    include: {
      variants: {
        include: {
          variantImages: {
            include: {
              media: true
            }
          }
        }
      }
    }
  });

  if (products.length === 0) {
    console.error('❌ No products found in database!');
    return;
  }

  products.forEach((p, index) => {
    console.log(`\n📦 Product [${index + 1}]: ${p.name}`);
    
    // 1. Theme/Color/Type Validation
    const hasTheme = !!p.theme;
    const hasBgColor = !!p.bgColor;
    const isConfigurable = p.productType === 'configurable';
    console.log(`   - Theme: ${p.theme} ${hasTheme ? '✅' : '❌'}`);
    console.log(`   - BgColor: ${p.bgColor} ${hasBgColor ? '✅' : '❌'}`);
    console.log(`   - Product Type: ${p.productType} ${isConfigurable ? '✅' : '❌'}`);

    // 2. Variant Validation
    const variants = p.variants;
    console.log(`   - Variants Count: ${variants.length} ${variants.length > 0 ? '✅' : '❌'}`);

    variants.forEach((v, vIndex) => {
      const hasPrice = v.price !== null;
      const hasSellingPrice = v.sellingPrice !== null;
      // We check if variant has images (seeded products use images field or variantImages)
      const hasImages = (v as any).images?.length > 0 || v.variantImages?.length > 0 || !!p.heroImage; 
      
      console.log(`     🔹 Variant [${vIndex + 1}]: ${v.sku}`);
      console.log(`        - Price: ${v.price} ${hasPrice ? '✅' : '❌'}`);
      console.log(`        - Selling Price: ${v.sellingPrice} ${hasSellingPrice ? '✅' : '❌'}`);
      console.log(`        - Image Source: ${hasImages ? '✅' : '❌'}`);
    });

    // 3. Error detection
    if (!hasTheme) console.error(`      🚨 ERROR: Missing theme for ${p.name}`);
    if (variants.length === 0) console.error(`      🚨 ERROR: Zero variants for ${p.name}`);
  });

  console.log('\n✅ Integrity Audit Complete.');
}

checkIntegrity()
  .catch((e) => {
    console.error('❌ Audit failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

