import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional, IsArray, IsUrl } from 'class-validator';

export class SubmitReviewDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsOptional()
  @IsString()
  productVariantId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class UpdateReviewStatusDto {
  @IsNotEmpty()
  @IsString()
  status: string; // 'approved', 'rejected', 'featured'
}


