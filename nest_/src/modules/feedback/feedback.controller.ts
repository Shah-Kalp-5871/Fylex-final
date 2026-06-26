import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { SubmitReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Controller('reviews')
export class FeedbackController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async getAllReviews() {
    return this.reviewService.getAllReviews();
  }

  @Post()
  async submitReview(
    @Body() dto: SubmitReviewDto,
    @Body('userId') userId: string, // Simplified for now
  ) {
    return this.reviewService.submitReview(userId, dto);
  }

  @Get('product/:id')
  async getProductReviews(@Param('id') productId: string) {
    return this.reviewService.getProductReviews(productId);
  }

  @Patch(':id/status')
  async updateReviewStatus(
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewStatusDto,
  ) {
    return this.reviewService.updateReviewStatus(reviewId, dto.status);
  }

  @Post(':id/vote')
  async voteReview(
    @Param('id') reviewId: string,
    @Body('type') type: 'helpful' | 'not_helpful',
  ) {
    return this.reviewService.voteReview(reviewId, type);
  }
}


