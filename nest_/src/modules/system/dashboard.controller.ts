import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly systemService: SystemService) {}

  @Get('stats')
  async getStats() {
    return this.systemService.getDashboardStats();
  }

  @Get()
  async getDashboard() {
    return this.systemService.getDashboardStats();
  }
}


