import { IsNotEmpty, IsOptional, IsString, IsBoolean, Length, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]{2,50}$/, { message: 'Name must only contain letters and be 2-50 characters' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 10, { message: 'Mobile must be exactly 10 digits' })
  @Matches(/^[0-9]+$/, { message: 'Mobile must contain only digits' })
  mobile: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 200)
  address: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'City must only contain letters' })
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Country must only contain letters' })
  country: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'Pincode must be exactly 6 digits' })
  @Matches(/^[0-9]+$/, { message: 'Pincode must contain only digits' })
  pincode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]{2,50}$/)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/)
  mobile?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/)
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/)
  pincode?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}


