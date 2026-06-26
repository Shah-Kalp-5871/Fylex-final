import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { FeedbackController } from './feedback.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class FeedbackModule {}


