import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { BeltService } from './belt.service';

@Controller('belts')
export class BeltController {
  constructor(private readonly beltService: BeltService) {}

  @Get()
  findAll() {
    return this.beltService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beltService.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.beltService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.beltService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beltService.remove(+id);
  }
}
