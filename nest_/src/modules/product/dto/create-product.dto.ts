import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDate, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  shortDesc?: string;

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @Transform(({ value }) => value ? Number(value) : null)
  @IsNumber()
  specialPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  specialPriceStart?: Date;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  @IsDate()
  specialPriceEnd?: Date;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  manageStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  qty?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  codAvailable?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isBestseller?: boolean;



  @IsOptional()
  brandId?: number | string;

  @IsOptional()
  mainCategoryId?: number | string;

  @IsOptional()
  categoryId?: number | string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  weight?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  length?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  width?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  heritageText?: string;

  @IsOptional()
  @IsString()
  bgColor?: string;

  @IsOptional()
  @IsString()
  accentColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  @IsString()
  gradient?: string;

  @IsOptional()
  @IsString()
  mistColor?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  discoverHeroBgImage?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  gallery?: any[];

  @IsOptional()
  @IsString()
  heroImage?: string;

  @IsOptional()
  heroImageId?: number | string | number;

  @IsOptional()
  @IsArray()
  galleryIds?: any[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  specifications?: any[];

  @IsOptional()
  @IsArray()
  variants?: any[];

  @IsOptional()
  @IsArray()
  tagIds?: any[];

  @IsOptional()
  taxClassId?: number | string;
}


