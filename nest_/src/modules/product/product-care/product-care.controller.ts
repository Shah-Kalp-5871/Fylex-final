import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ProductCareService } from './product-care.service';
import { CreateProductCareDto } from './dto/create-product-care.dto';
import { UpdateProductCareDto } from './dto/update-product-care.dto';

@Controller('product-care')
export class ProductCareController {
  constructor(private readonly productCareService: ProductCareService) {}

  @Post()
  create(@Body() createProductCareDto: any) {
    return this.productCareService.create(createProductCareDto);
  }

  @Get('grouped')
  findAllProductsWithSteps() {
    return this.productCareService.findAllProductsWithSteps();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.productCareService.findByProduct(+productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productCareService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductCareDto: any) {
    return this.productCareService.update(+id, updateProductCareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productCareService.remove(+id);
  }
}
