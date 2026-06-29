import { Module } from '@nestjs/common';
import { BeltService } from './belt.service';
import { BeltController } from './belt.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BeltController],
  providers: [BeltService],
  exports: [BeltService],
})
export class BeltModule {}
