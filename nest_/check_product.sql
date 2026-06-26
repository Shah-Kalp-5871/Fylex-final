SELECT 
    v.id as variant_id, 
    v.sku, 
    a.name as attr_name, 
    av.label as attr_value 
FROM "ProductVariant" v
JOIN "ProductVariantAttribute" pva ON v.id = pva."variantId"
JOIN "AttributeValue" av ON pva."attributeValueId" = av.id
JOIN "Attribute" a ON av."attributeId" = a.id
WHERE v."productId" = 20;
