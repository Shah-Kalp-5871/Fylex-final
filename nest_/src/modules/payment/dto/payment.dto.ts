import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsString()
  receipt: string;
}


