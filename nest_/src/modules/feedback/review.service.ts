import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  // 1. Submit a review
  async submitReview(customerId: string, dto: SubmitReviewDto) {
    const cId = Number(customerId);
    const pId = Number(dto.productId);

    // a. Check if user already reviewed this product
    const existingReview = await this.prisma.productReview.findFirst({
        where: { customerId: cId, productId: pId }
    });
    if (existingReview) {
        throw new BadRequestException('You have already reviewed this product');
    }

    // b. Verified Purchase Check
    const orderItem = await this.prisma.orderItem.findFirst({
        where: {
            order: { customerId: cId, status: { in: ['delivered', 'completed'] } },
            productId: pId
        }
    });

    // c. Create Review
    const review = await this.prisma.productReview.create({
      data: {
        productId: pId,
        customerId: cId,
        productVariantId: dto.productVariantId ? Number(dto.productVariantId) : null,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        status: 'pending', // Requires moderation
        isVerified: !!orderItem,
      },
    });
    return { success: true, data: review };
  }

  // 2. Get approved reviews for a product
  async getProductReviews(productId: string) {
    const pId = Number(productId);
    return this.prisma.productReview.findMany({
      where: { productId: pId, status: 'approved' },
      include: {
        customer: { select: { name: true } },
        images: { include: { media: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Admin: Update Review Status
  async updateReviewStatus(reviewId: string, status: string) {
    const rId = Number(reviewId);
    const review = await this.prisma.productReview.findUnique({ where: { id: rId } });
    if (!review) throw new NotFoundException('Review not found');

    const updatedReview = await this.prisma.productReview.update({
      where: { id: rId },
      data: { status }
    });
    return { success: true, data: { ...updatedReview, isActive: updatedReview.status === 'approved' } };
  }

  // Admin: Delete review
  async deleteReview(id: string | number) {
    await this.prisma.productReview.delete({
      where: { id: Number(id) }
    });
    return { success: true };
  }

  // 4. Vote Review
  async voteReview(reviewId: string, type: 'helpful' | 'not_helpful') {
      const rId = Number(reviewId);
      if (type === 'helpful') {
          return this.prisma.productReview.update({
              where: { id: rId },
              data: { helpfulCount: { increment: 1 } }
          });
      } else {
          return this.prisma.productReview.update({
              where: { id: rId },
              data: { notHelpfulCount: { increment: 1 } }
          });
      }
  }

  // Admin: Get all reviews
  async getAllReviews() {
    const reviews = await this.prisma.productReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        product: { select: { name: true, sku: true } },
      }
    });

    const mapped = reviews.map(r => ({
      ...r,
      isActive: r.status === 'approved',
    }));

    return { success: true, data: mapped };
  }
}


