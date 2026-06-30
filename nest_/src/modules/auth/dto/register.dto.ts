import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  mobile?: string;

  @IsNotEmpty()
  @MinLength(4)
  otp: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  gender?: string;

  @IsOptional()
  dob?: string;

  @IsOptional()
  city?: string;
}


