import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { LoyaltyService } from './loyalty.service';
import { MarketingController } from './marketing.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingController],
  providers: [MarketingService, LoyaltyService],
  exports: [MarketingService, LoyaltyService],
})
export class MarketingModule {}


