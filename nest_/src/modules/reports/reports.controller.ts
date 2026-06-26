import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardReports() {
    return this.reportsService.getDashboardReports();
  }

  @Get('variant-performance')
  getVariantPerformance() {
    return this.reportsService.getVariantPerformance();
  }

  @Get('revenue')
  getRevenueReport() {
    return this.reportsService.getRevenueReport();
  }

  @Get('orders')
  getOrdersReport() {
    return this.reportsService.getOrdersReport();
  }

  @Get('inventory')
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('financial')
  getFinancialSummary() {
    return this.reportsService.getFinancialSummary();
  }

  @Get('traffic')
  getTrafficReport() {
    return this.reportsService.getTrafficReport();
  }
}
