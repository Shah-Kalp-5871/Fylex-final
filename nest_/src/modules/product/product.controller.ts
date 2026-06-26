import { Controller, Get, Post, Body, Put, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { VariantGeneratorService } from './variant-generator.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly variantGenerator: VariantGeneratorService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 20, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@Body() createProductDto: CreateProductDto, @UploadedFiles() images?: Array<Express.Multer.File>) {
    return this.productService.createProduct(createProductDto, images);
  }

  @Get()
  findAll(@Query() filters: ProductFilterDto) {
    return this.productService.getAllProducts(filters);
  }

  @Get('featured')
  async getFeatured() {
    return this.productService.getFeaturedProducts();
  }

  @Get('inventory')
  async getInventory() {
    return this.productService.getInventory();
  }

  @Patch('inventory/:id')
  async updateInventory(
    @Param('id') id: string,
    @Body() body: { qty: number; type: string; note?: string; adminId?: string }
  ) {
    return this.productService.updateInventoryStock(id, body.qty, body.type, body.note, body.adminId);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.productService.getProductById(idOrSlug);
  }

  @Get('by-category/:slug')
  async findByCategory(
    @Param('slug') slug: string,
    @Query() filters: ProductFilterDto,
  ) {
    return this.productService.getProductsByCategory(slug, filters);
  }



  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 20, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Array<Express.Multer.File>
  ) {
    return this.productService.updateProduct(id, updateProductDto, images);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

  // Variant Management
  @Post(':id/generate-variants')
  async generateVariants(
    @Param('id') id: string,
    @Body() body: { selections: any[] }
  ) {
    const product = await this.productService.getProductById(id);
    const selections = (body.selections || []).map(s => ({
      attributeId: Number(s.attributeId),
      valueIds: (s.valueIds || s.attributeValueIds || []).map(vId => Number(vId))
    }));
    
    return this.variantGenerator.generateVariants(
      Number(product.id), 
      selections, 
      product.productCode || 'PROD'
    );
  }

  @Get(':id/variants')
  async getVariants(@Param('id') id: string) {
    return this.productService.getProductVariants(id);
  }

  // Product Media (e.g., 360 View)
  @Post(':id/media/360')
  @UseInterceptors(FilesInterceptor('images', 100, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload360Media(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.productService.uploadProductMedia(id, files, '360');
  }
}

@Controller('variants')
export class VariantController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllVariants(@Query('page') page: string = '1', @Query('limit') limit: string = '50') {
    return this.productService.getAllVariants(Number(page), Number(limit));
  }

  @Patch(':id')
  async updateVariant(@Param('id') id: string, @Body() body: any) {
    return this.productService.updateVariant(id, body);
  }

  @Post(':id/media')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadVariantMedia(
    @Param('id') id: string,
    @Body('type') type: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    return this.productService.uploadVariantMedia(id, files, type);
  }
}


