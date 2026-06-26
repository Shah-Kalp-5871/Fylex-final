import { PartialType } from '@nestjs/mapped-types';
import { CreateAttributeValueDto } from './create-attribute.dto';

export class UpdateAttributeValueDto extends PartialType(CreateAttributeValueDto) {}


