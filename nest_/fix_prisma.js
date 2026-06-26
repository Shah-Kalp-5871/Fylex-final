const fs = require('fs');
const path = 'prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8').split('\n');

// Keep until line 602 (category_attributes end)
let start = content.slice(0, 602);

// Keep from WishlistItem
let wishIndex = content.findIndex(line => line.includes('model WishlistItem'));
if (wishIndex === -1) {
    console.error('WishlistItem not found!');
    process.exit(1);
}
let end = content.slice(wishIndex);

// Define all the missing models
let middle = `
model CategoryHierarchy {
  id           BigInt @id @default(autoincrement())
  ancestorId   BigInt @map("ancestor_id")
  descendantId BigInt @map("descendant_id")
  depth        Int    @default(0)

  @@unique([ancestorId, descendantId], map: "category_hierarchies_ancestor_id_descendant_id_unique")
  @@index([descendantId], map: "category_hierarchies_descendant_id_index")
  @@map("category_hierarchies")
}

model CategorySpecGroup {
  categoryId           BigInt             @map("category_id")
  specificationGroupId BigInt             @map("specification_group_id")
  category             Category           @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  specGroup            SpecificationGroup @relation(fields: [specificationGroupId], references: [id], onDelete: Cascade)

  @@id([categoryId, specificationGroupId])
  @@index([specificationGroupId], map: "category_spec_groups_specification_group_id_foreign")
  @@map("category_spec_groups")
}

model Product {
  id                  BigInt                 @id @default(autoincrement())
  brandId             BigInt?                @map("brand_id")
  taxClassId          BigInt?                @map("tax_class_id")
  mainCategoryId      BigInt?                @map("main_category_id")
  name                String
  slug                String                 @unique(map: "products_slug_unique")
  sku                 String                 @unique(map: "products_sku_unique")
  productCode         String?                @map("product_code")
  productType         String                 @default("simple") @map("product_type")
  subtitle            String?
  tagline             String?
  heroImage           String?                @map("hero_image")
  heritageText        String?                @map("heritage_text")
  bgColor             String?                @map("bg_color")
  accentColor         String?                @map("accent_color")
  textColor           String?                @map("text_color")
  gradient            String?                @map("gradient")
  mistColor           String?                @map("mist_color")
  description         String?
  shortDescription    String?                @map("short_description")
  price               Decimal                @default(0.00)
  specialPrice        Decimal?               @map("special_price")
  specialPriceStart   DateTime?              @map("special_price_start")
  specialPriceEnd     DateTime?              @map("special_price_end")
  sellingPrice        Decimal                @default(0.00) @map("selling_price")
  manageStock         Boolean                @default(true) @map("manage_stock")
  qty                 Int                    @default(0)
  inStock             Boolean                @default(true) @map("in_stock")
  codAvailable        Boolean                @default(true) @map("cod_available")
  status              String                 @default("active")
  isFeatured          Boolean                @default(false) @map("is_featured")
  isNew               Boolean                @default(false) @map("is_new")
  isBestseller        Boolean                @default(false) @map("is_bestseller")
  weight              Decimal?
  length              Decimal?
  width               Decimal?
  height              Decimal?
  viewed              Int                    @default(0)
  metaTitle           String?                @map("meta_title")
  metaDescription     String?                @map("meta_description")
  metaKeywords        String?                @map("meta_keywords")
  images              Json?                  @map("images")
  createdAt           DateTime?              @map("created_at")
  updatedAt           DateTime?              @map("updated_at")
  deletedAt           DateTime?              @map("deleted_at")
  cartItems           CartItem[]
  categories          CategoryProduct[]
  crossSellsFrom      CrossSellProduct[]     @relation("ProductCrossSellTargets")
  crossSellsTo        CrossSellProduct[]     @relation("ProductCrossSell")
  stockTransferItems  StockTransferItem[]
  itemCollectionItems ItemCollectionItem[]
  offerRewards        OfferReward[]          @relation("OfferRewardProduct")
  orderItems          OrderItem[]
  productReviews      ProductReview[]
  specifications      ProductSpecification[]
  tags                ProductTag[]
  variants            ProductVariant[]
  productMedia        ProductMedia[]
  brand               Brand?                 @relation(fields: [brandId], references: [id])
  mainCategory        Category?              @relation("ProductMainCategory", fields: [mainCategoryId], references: [id])
  taxClass            TaxClass?              @relation(fields: [taxClassId], references: [id])
  relatedTo           RelatedProduct[]       @relation("ProductRelated")
  relatedFrom         RelatedProduct[]       @relation("ProductRelatedTargets")
  reviews             Review[]
  stockHistories      StockHistory[]
  upSellsTo           UpSellProduct[]        @relation("ProductUpSell")
  upSellsFrom         UpSellProduct[]        @relation("ProductUpSellTargets")
  @@index([status], map: "products_status_index")
  @@index([brandId], map: "products_brand_id_foreign")
  @@index([taxClassId], map: "products_tax_class_id_foreign")
  @@index([mainCategoryId], map: "products_main_category_id_foreign")
  @@map("products")
}

model ProductVariant {
  id                  BigInt               @id @default(autoincrement())
  productId           BigInt               @map("product_id")
  sku                 String               @unique(map: "product_variants_sku_unique")
  price               Decimal              @default(0.00)
  comparePrice        Decimal?             @map("compare_price")
  costPrice           Decimal?             @map("cost_price")
  specialPrice        Decimal?             @map("special_price")
  specialPriceStart   DateTime?            @map("special_price_start")
  specialPriceEnd     DateTime?            @map("special_price_end")
  sellingPrice        Decimal              @default(0.00) @map("selling_price")
  manageStock         Boolean              @default(true) @map("manage_stock")
  qty                 Int                  @default(0) @map("stock_quantity")
  reservedQuantity    Int                  @default(0) @map("reserved_quantity")
  inStock             Boolean              @default(true) @map("in_stock")
  stockStatus         String               @default("instock") @map("stock_status")
  isActive            Boolean              @default(true) @map("is_active")
  isDefault           Boolean              @default(false) @map("is_default")
  combinationHash     String?              @map("combination_hash")
  weight              Decimal?
  length              Decimal?
  width               Decimal?
  height              Decimal?
  createdAt           DateTime?            @map("created_at")
  updatedAt           DateTime?            @map("updated_at")
  deletedAt           DateTime?            @map("deleted_at")
  cartItems           CartItem[]
  stockTransferItems  StockTransferItem[]
  itemCollectionItems ItemCollectionItem[]
  offerRewards        OfferReward[]        @relation("OfferRewardVariant")
  offerVariants       OfferVariant[]
  orderItems          OrderItem[]
  priceHistories      PriceHistory[]
  productReviews      ProductReview[]
  product             Product              @relation(fields: [productId], references: [id], onDelete: Cascade)
  stockHistories      StockHistory[]
  tierPrices          ProductTierPrice[]
  variantAttributes   VariantAttribute[]
  variantImages       VariantImage[]
  warehouseStocks     WarehouseStock[]
  wishlistItems       WishlistItem[]
  @@index([productId], map: "product_variants_product_id_foreign")
  @@index([isActive], map: "product_variants_is_active_index")
  @@map("product_variants")
}

model CategoryProduct {
  productId  BigInt   @map("product_id")
  categoryId BigInt   @map("category_id")
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@id([productId, categoryId])
  @@index([categoryId], map: "category_products_category_id_foreign")
  @@map("category_products")
}

model ProductTag {
  productId BigInt  @map("product_id")
  tagId     BigInt  @map("tag_id")
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([productId, tagId])
  @@index([tagId], map: "product_tags_tag_id_foreign")
  @@map("product_tags")
}

model ProductSpecification {
  id                   BigInt              @id @default(autoincrement())
  productId            BigInt              @map("product_id")
  specificationId      BigInt              @map("specification_id")
  value                String
  createdAt            DateTime?           @map("created_at")
  updatedAt            DateTime?           @map("updated_at")
  specificationValueId BigInt?             @map("specification_value_id")
  product              Product             @relation(fields: [productId], references: [id], onDelete: Cascade)
  specification        Specification       @relation(fields: [specificationId], references: [id], onDelete: Cascade)
  specificationValue   SpecificationValue? @relation(fields: [specificationValueId], references: [id])
  @@index([productId], map: "product_specifications_product_id_foreign")
  @@index([specificationId], map: "product_specifications_specification_id_foreign")
  @@map("product_specifications")
}

model VariantAttribute {
  id               BigInt         @id @default(autoincrement())
  variantId        BigInt         @map("variant_id")
  attributeId      BigInt         @map("attribute_id")
  attributeValueId BigInt         @map("attribute_value_id")
  createdAt        DateTime?      @map("created_at")
  updatedAt        DateTime?      @map("updated_at")
  attributeValue   AttributeValue @relation(fields: [attributeValueId], references: [id], onDelete: Cascade)
  variant          ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  @@unique([variantId, attributeId], map: "variant_attributes_variant_id_attribute_id_unique")
  @@index([variantId], map: "variant_attributes_variant_id_index")
  @@index([attributeValueId], map: "variant_attributes_attribute_value_id_index")
  @@map("variant_attributes")
}

model VariantImage {
  id        BigInt         @id @default(autoincrement())
  variantId BigInt         @map("variant_id")
  mediaId   BigInt         @map("media_id")
  isPrimary Int            @default(0) @map("is_primary")
  sortOrder Int            @default(0) @map("sort_order")
  createdAt DateTime?      @map("created_at")
  updatedAt DateTime?      @map("updated_at")
  type      String         @default("GALLERY") @map("type")
  media     Media          @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  @@unique([variantId, mediaId], map: "variant_images_variant_id_media_id_unique")
  @@index([variantId], map: "variant_images_variant_id_index")
  @@index([mediaId], map: "variant_images_media_id_foreign")
  @@map("variant_images")
}

model ProductMedia {
  id        BigInt   @id @default(autoincrement())
  productId BigInt   @map("product_id")
  mediaId   BigInt   @map("media_id")
  type      String   @default("GALLERY") @map("type")
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime? @map("created_at")
  updatedAt DateTime? @map("updated_at")
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  media     Media    @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  @@index([productId], map: "product_media_product_id_index")
  @@index([mediaId], map: "product_media_media_id_foreign")
  @@map("product_media")
}

model RelatedProduct {
  productId        BigInt  @map("product_id")
  relatedProductId BigInt  @map("related_product_id")
  product          Product @relation("ProductRelated", fields: [productId], references: [id], onDelete: Cascade)
  relatedProduct   Product @relation("ProductRelatedTargets", fields: [relatedProductId], references: [id], onDelete: Cascade)
  @@id([productId, relatedProductId])
  @@index([relatedProductId], map: "related_products_related_product_id_foreign")
  @@map("related_products")
}

model CrossSellProduct {
  productId          BigInt  @map("product_id")
  crossSellProductId BigInt  @map("cross_sell_product_id")
  crossSellProduct   Product @relation("ProductCrossSellTargets", fields: [crossSellProductId], references: [id], onDelete: Cascade)
  product            Product @relation("ProductCrossSell", fields: [productId], references: [id], onDelete: Cascade)
  @@id([productId, crossSellProductId])
  @@index([crossSellProductId], map: "cross_sell_products_cross_sell_product_id_foreign")
  @@map("cross_sell_products")
}

model UpSellProduct {
  productId       BigInt  @map("product_id")
  upSellProductId BigInt  @map("up_sell_product_id")
  product         Product @relation("ProductUpSell", fields: [productId], references: [id], onDelete: Cascade)
  upSellProduct   Product @relation("ProductUpSellTargets", fields: [upSellProductId], references: [id], onDelete: Cascade)
  @@id([productId, upSellProductId])
  @@index([upSellProductId], map: "up_sell_products_up_sell_product_id_foreign")
  @@map("up_sell_products")
}
`;

fs.writeFileSync(path, start.join('\n') + middle + end.join('\n'));
console.log('Schema fixed successfully!');
