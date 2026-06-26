const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.update({
    where: { id: BigInt(20) },
    data: {
      name: "Fylex OceanMaster Chronograph",
      slug: "fylex-oceanmaster-chronograph",
      subtitle: "Precision forged for the deep.",
      tagline: "Where Elegance Meets Endurance.",
      heritageText: "Since our inception, Fylex has pushed the boundaries of horology. The OceanMaster series continues this legacy, crafted for those who demand excellence in the most unforgiving environments.",
      shortDescription: "A professional-grade dive watch featuring a robust stainless steel case, unidirectional ceramic bezel, and a highly legible luminescent dial.",
      description: "<p>The Fylex OceanMaster Chronograph is the ultimate companion for underwater exploration and everyday elegance. Engineered to withstand extreme pressures, it features a helium escape valve and an impressive water resistance of up to 300 meters.</p><p>Its high-precision automatic movement ensures accurate timekeeping, while the scratch-resistant sapphire crystal protects the deep blue sunburst dial. The integrated stainless steel bracelet provides a secure and comfortable fit, making it an indispensable tool for divers and a statement piece for connoisseurs.</p>",
      metaTitle: "Fylex OceanMaster Chronograph | Professional Dive Watch",
      metaDescription: "Discover the Fylex OceanMaster Chronograph. A premium dive watch featuring 300m water resistance, automatic movement, and a ceramic bezel."
    }
  });
  console.log("Product updated successfully:", p.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
