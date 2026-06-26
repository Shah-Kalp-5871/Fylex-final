SELECT 
    v.id as variant_id, 
    v.sku, 
    a.name as attr_name, 
    av.label as attr_value 
FROM "product_variants" v
JOIN "variant_attributes" pva ON v.id = pva."variant_id"
JOIN "attribute_values" av ON pva."attribute_value_id" = av.id
JOIN "attributes" a ON av."attribute_id" = a.id
WHERE v."product_id" = 20;
