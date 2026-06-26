import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRelationalIntegrity() {
  console.log('🔍 Checking Relational Integrity...');

  const products = await prisma.product.findMany({
    include: {
      mainCategory: {
        include: {
          attributes: { include: { attribute: true } },
          specGroups: { include: { specGroup: { include: { specifications: { include: { specification: true } } } } } }
        }
      },
      specifications: { include: { specification: true } },
      variants: {
        include: {
          variantAttributes: { include: { attributeValue: { include: { attribute: true } } } }
        }
      }
    }
  });

  products.forEach(p => {
    console.log(`\n📦 Product: ${p.name}`);
    console.log(`   - Category: ${p.mainCategory?.name}`);
    
    console.log(`   - Specifications:`);
    p.specifications.forEach(s => {
      console.log(`     🔹 ${s.specification.name}: ${s.value}`);
    });

    console.log(`   - Category Attributes:`);
    p.mainCategory?.attributes.forEach(a => {
      console.log(`     🔹 ${a.attribute.name} (Code: ${a.attribute.code})`);
    });

    console.log(`   - Variants & Their Attribute Selections:`);
    p.variants.forEach(v => {
      const selections = v.variantAttributes.map(va => `${va.attributeValue.attribute.name}: ${va.attributeValue.label}`).join(', ');
      console.log(`     🔹 ${v.sku} -> { ${selections} }`);
    });
  });
}

checkRelationalIntegrity()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

