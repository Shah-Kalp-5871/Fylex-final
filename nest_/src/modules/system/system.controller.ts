import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('inventory/low-stock')
  async getLowStockReport() {
    return this.systemService.getLowStockReport();
  }

  @Get('dashboard-stats')
  async getDashboardStats() {
    return this.systemService.getDashboardStats();
  }

  @Get('settings')
  async getSettings() {
    return this.systemService.getSettings();
  }

  @Post('settings')
  async updateSettings(@Body() data: any) {
    return this.systemService.updateSettings(data);
  }

  @Get('taxes')
  async getTaxes() {
    return this.systemService.getTaxes();
  }

  @Post('taxes')
  async createTaxRate(@Body() data: any) {
    return this.systemService.createTaxRate(data);
  }

  @Get('taxes/classes')
  async getTaxClasses() {
    return this.systemService.getTaxClasses();
  }

  @Post('taxes/classes')
  async createTaxClass(@Body() data: any) {
    return this.systemService.createTaxClass(data);
  }

  @Put('taxes/classes/:id')
  async updateTaxClass(@Param('id') id: string, @Body() data: any) {
    return this.systemService.updateTaxClass(Number(id), data);
  }

  @Delete('taxes/classes/:id')
  async deleteTaxClass(@Param('id') id: string) {
    return this.systemService.deleteTaxClass(Number(id));
  }

  @Put('taxes/:id')
  async updateTaxRate(@Param('id') id: string, @Body() data: any) {
    return this.systemService.updateTaxRate(Number(id), data);
  }

  @Delete('taxes/:id')
  async deleteTaxRate(@Param('id') id: string) {
    return this.systemService.deleteTaxRate(Number(id));
  }


  @Get('shipping-methods')
  async getShippingMethods() {
    return this.systemService.getShippingMethods();
  }

  @Post('shipping-methods')
  async createShippingMethod(@Body() data: any) {
    return this.systemService.createShippingMethod(data);
  }

  @Put('shipping-methods/:id')
  async updateShippingMethod(@Param('id') id: string, @Body() data: any) {
    return this.systemService.updateShippingMethod(Number(id), data);
  }

  @Delete('shipping-methods/:id')
  async deleteShippingMethod(@Param('id') id: string) {
    return this.systemService.deleteShippingMethod(Number(id));
  }
}


