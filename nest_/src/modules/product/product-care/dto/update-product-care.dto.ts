import { PartialType } from '@nestjs/swagger';
import { CreateProductCareDto } from './create-product-care.dto';

export class UpdateProductCareDto extends PartialType(CreateProductCareDto) {}
