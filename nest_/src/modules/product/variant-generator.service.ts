import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VariantGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates all possible combinations (Cartesian Product) of the provided attributes and values.
   * @param productId The ID of the product
   * @param selections An array of objects containing attributeId and array of selected attributeValueIds
   * @param productCode The base product code for SKU generation
   */
  async generateVariants(productId: number, selections: { attributeId: number, valueIds: number[] }[], productCode: string) {
    if (selections.length === 0) {
      throw new BadRequestException('No attributes selected for variant generation.');
    }

    // 1. Fetch ALL existing variants for this product to check for duplicates
    const existingVariants = await this.prisma.productVariant.findMany({
      where: { productId },
      include: {
        variantAttributes: true,
        variantImages: { include: { media: true } }
      }
    });

    // Create a map of existing combinations (sorted string of value IDs as key)
    const existingCombos = new Set(
      existingVariants.map(v => 
        v.variantAttributes.map(va => va.attributeValueId.toString()).sort().join(',')
      )
    );

    // 2. Calculate Cartesian Product of selected values
    const combinations = this.cartesianProduct(selections.map(s => s.valueIds));

    if (combinations.length > 1000) {
       throw new BadRequestException('Too many combinations (>1000). Please reduce attribute selections.');
    }

    // 3. Fetch all AttributeValues for SKU/Name generation
    const allValueIds = selections.flatMap(s => s.valueIds);
    const attributeValues = await this.prisma.attributeValue.findMany({
      where: { id: { in: allValueIds } },
      include: { attribute: true }
    });

    const valueMap = new Map<string, any>(attributeValues.map(v => [v.id.toString(), v]));
    const variantsToCreate: any[] = [];

    for (const combo of combinations) {
      // Sort combo to ensure consistent comparison
      const comboStr = combo.map(id => id.toString()).sort().join(',');
      
      // SKIP if this combination already exists
      if (existingCombos.has(comboStr)) continue;

      const comboValues = combo.map(id => valueMap.get(id.toString())).filter(v => v !== undefined);
      if (comboValues.length !== selections.length) continue;

      // Generate SKU
      const skuParts = [productCode];
      for (const val of comboValues) {
        const code = val.code || val.value.substring(0, 3).toUpperCase();
        skuParts.push(code);
      }
      const sku = skuParts.join('-');

      variantsToCreate.push({
        sku,
        price: Number(0),
        qty: 0,
        inStock: true,
        isActive: true,
        attributeValueIds: combo
      });
    }

    // 4. Create ONLY the new variants
    const newResults = await this.prisma.$transaction(async (tx) => {
      const created: any[] = [];
      for (const vData of variantsToCreate) {
        const { attributeValueIds, ...variantFields } = vData;
        const variant = await tx.productVariant.create({ data: { ...variantFields, productId } });

        for (const valueId of attributeValueIds) {
          const attrValue = valueMap.get(valueId.toString());
          if (attrValue) {
            await tx.variantAttribute.create({
              data: {
                variantId: variant.id,
                attributeId: attrValue.attributeId,
                attributeValueId: valueId,
              }
            });
          }
        }

        // Enrich the newly created variant for the response
        created.push({
          ...variant,
          stock: variant.qty, // Map qty to stock for consistency
          name: attributeValueIds.map(id => valueMap.get(id.toString())?.label || valueMap.get(id.toString())?.value).join(', '),
          attributeValues: attributeValueIds.map(id => ({
            attributeId: valueMap.get(id.toString())?.attributeId?.toString(),
            attributeValueId: id.toString()
          }))
        });
      }
      return created;
    });

    // 5. Merge existing variants with new ones for the frontend to display a complete list
    const mappedExisting = existingVariants.map(v => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      stock: v.qty,
      name: v.variantAttributes
        .map(va => valueMap.get(va.attributeValueId.toString())?.label || valueMap.get(va.attributeValueId.toString())?.value || 'Unknown')
        .join(', '),
      attributeValues: v.variantAttributes.map(va => ({
        attributeId: va.attributeId.toString(),
        attributeValueId: va.attributeValueId.toString()
      })),
      heroImage: v.variantImages.find(i => i.type === 'MAIN')?.media,
      gallery: v.variantImages.filter(i => i.type === 'GALLERY').map(i => i.media)
    }));

    return {
      success: true,
      count: newResults.length,
      data: [...mappedExisting, ...newResults]
    };
  }

  private cartesianProduct(arrays: number[][]): number[][] {
    return arrays.reduce((a, b) => {
      return a.flatMap(d => b.map(e => [d, e].flat())) as number[][];
    }, [[]] as number[][]);
  }
}


