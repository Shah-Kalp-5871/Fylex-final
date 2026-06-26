import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { DashboardController } from './dashboard.controller';
import { SettingsController } from './settings.controller';
import { TaxesController } from './taxes.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    SystemController, 
    DashboardController, 
    SettingsController, 
    TaxesController
  ],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}


