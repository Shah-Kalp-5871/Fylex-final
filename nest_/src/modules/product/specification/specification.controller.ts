import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { SpecificationService } from './specification.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Specifications')
@Controller('specifications')
export class SpecificationController {
  constructor(private readonly specificationService: SpecificationService) {}

  // --- Groups ---
  @Get('groups')
  @ApiOperation({ summary: 'Get all specification groups' })
  findAllGroups() {
    return this.specificationService.findAllGroups();
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Get specification group by ID' })
  findOneGroup(@Param('id') id: string) {
    return this.specificationService.findOneGroup(id);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create a new specification group' })
  createGroup(@Body() data: any) {
    return this.specificationService.createGroup(data);
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Update a specification group' })
  updateGroup(@Param('id') id: string, @Body() data: any) {
    return this.specificationService.updateGroup(id, data);
  }

  @Delete('groups/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specification group' })
  removeGroup(@Param('id') id: string) {
    return this.specificationService.removeGroup(id);
  }

  // --- Group-Specification Mapping ---
  @Post('groups/:groupId/:specId')
  @ApiOperation({ summary: 'Add specification to group' })
  addSpecToGroup(
    @Param('groupId') groupId: string,
    @Param('specId') specId: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.specificationService.addSpecToGroup(groupId, specId, sortOrder);
  }

  @Delete('groups/:groupId/:specId')
  @ApiOperation({ summary: 'Remove specification from group' })
  removeSpecFromGroup(
    @Param('groupId') groupId: string,
    @Param('specId') specId: string,
  ) {
    return this.specificationService.removeSpecFromGroup(groupId, specId);
  }

  // --- Specifications ---
  @Get()
  @ApiOperation({ summary: 'Get all specifications' })
  findAll() {
    return this.specificationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specification by ID' })
  findOne(@Param('id') id: string) {
    return this.specificationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new specification' })
  create(@Body() data: any) {
    return this.specificationService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specification' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.specificationService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specification' })
  remove(@Param('id') id: string) {
    return this.specificationService.remove(id);
  }

  // --- Specification Values ---
  @Get(':id/values')
  @ApiOperation({ summary: 'Get all values for a specification' })
  findAllValues(@Param('id') id: string) {
    return this.specificationService.findAllValues(id);
  }

  @Post(':id/values')
  @ApiOperation({ summary: 'Create a new specification value' })
  createValue(@Param('id') id: string, @Body() data: any) {
    return this.specificationService.createValue(id, data);
  }

  @Put('values/:id')
  @ApiOperation({ summary: 'Update a specification value' })
  updateValue(@Param('id') id: string, @Body() data: any) {
    return this.specificationService.updateValue(id, data);
  }

  @Delete('values/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specification value' })
  removeValue(@Param('id') id: string) {
    return this.specificationService.removeValue(id);
  }
}


