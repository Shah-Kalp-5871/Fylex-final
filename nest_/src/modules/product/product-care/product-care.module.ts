import { Module } from '@nestjs/common';
import { ProductCareService } from './product-care.service';
import { ProductCareController } from './product-care.controller';

@Module({
  controllers: [ProductCareController],
  providers: [ProductCareService],
})
export class ProductCareModule {}
