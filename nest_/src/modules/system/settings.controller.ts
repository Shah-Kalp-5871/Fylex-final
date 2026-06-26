import { Controller, Get, Post, Body } from '@nestjs/common';
import { SystemService } from '../system/system.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  async getSettings() {
    return this.systemService.getSettings();
  }

  @Post()
  async updateSettings(@Body() data: any) {
    return this.systemService.updateSettings(data);
  }
}


