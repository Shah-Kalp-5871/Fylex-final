import { Controller, Get, Post, Put, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Attributes')
@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  // --- Attribute Value Routes ---

  @Put('values/:valueId')
  @ApiOperation({ summary: 'Update an attribute value' })
  updateValue(@Param('valueId') valueId: string, @Body() updateAttributeValueDto: UpdateAttributeValueDto) {
    return this.attributeService.updateValue(valueId, updateAttributeValueDto);
  }

  @Delete('values/:valueId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attribute value' })
  removeValue(@Param('valueId') valueId: string) {
    return this.attributeService.removeValue(valueId);
  }

  // --- Attribute Routes ---

  @Get()
  @ApiOperation({ summary: 'Get all attributes' })
  findAll() {
    return this.attributeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attribute by ID' })
  findOne(@Param('id') id: string) {
    return this.attributeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new attribute' })
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an attribute' })
  update(@Param('id') id: string, @Body() updateAttributeDto: UpdateAttributeDto) {
    return this.attributeService.update(id, updateAttributeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attribute' })
  remove(@Param('id') id: string) {
    return this.attributeService.remove(id);
  }

  @Post(':id/values')
  @ApiOperation({ summary: 'Add a value to an attribute' })
  addValue(@Param('id') id: string, @Body() createAttributeValueDto: CreateAttributeValueDto) {
    return this.attributeService.createValue(id, createAttributeValueDto);
  }
}


