import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  // Validate a coupon based on code, customer and cart amount
  async validateCoupon(customerId: string, code: string, cartAmount: number) {
    const now = new Date();
    const cId = Number(customerId);

    // 1. Fetch active coupon (Offer)
    const offer = await this.prisma.offer.findFirst({
      where: {
        code: code,
        status: 1, // Active
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });

    if (!offer) {
      throw new NotFoundException('Invalid or expired coupon code');
    }

    // 2. Minimum/Maximum Cart Amount check
    if (offer.minCartAmount && Number(cartAmount) < Number(offer.minCartAmount)) {
      throw new BadRequestException(`Minimum cart amount not met: ${offer.minCartAmount}`);
    }
    if (offer.maxCartAmount && Number(cartAmount) > Number(offer.maxCartAmount)) {
      throw new BadRequestException(`Maximum cart amount exceeded: ${offer.maxCartAmount}`);
    }

    // 3. Overall Usage Limit check
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    // 4. Per Customer Usage Limit check
    if (offer.usesPerCustomer) {
      const usageCount = await this.prisma.offerUsage.count({
        where: { offerId: offer.id, customerId: cId },
      });
      if (usageCount >= offer.usesPerCustomer) {
        throw new BadRequestException('You have already used this coupon maximum times');
      }
    }

    // 5. One-Time Coupon check
    if (offer.couponType === 'one_time' && offer.usedCount >= 1) {
      throw new BadRequestException('This one-time coupon has already been used');
    }

    return {
      ...offer,
      isActive: offer.status === 1
    };
  }

  // CRUD Operations for Admin
  async getAllOffers() {
    const offers = await this.prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        usages: {
          include: { order: true }
        }
      }
    });

    const mapped = offers.map(offer => {
      // Calculate per-coupon analytics
      const totalDiscountGiven = offer.usages.reduce((sum, u) => sum + (Number(u.discountAmount) || 0), 0);
      const totalRevenue = offer.usages.reduce((sum, u) => sum + (u.order ? Number(u.order.grandTotal) : 0), 0);
      
      const { usages, ...rest } = offer; // remove usages from response to keep payload light, maybe? Or keep it if frontend needs it. Wait, frontend needs usages for the drawer.
      
      return {
        ...offer, // keep usages for the modal
        isActive: offer.status === 1,
        analytics: {
          totalUses: offer.usages.length,
          discountSum: totalDiscountGiven,
          revenueSum: totalRevenue
        }
      };
    });

    return { success: true, data: mapped };
  }

  async getAnalyticsDashboard() {
    const offers = await this.prisma.offer.findMany({
      include: {
        usages: {
          include: { order: true }
        }
      }
    });

    let totalCoupons = offers.length;
    let activeCoupons = offers.filter(o => o.status === 1).length;
    let totalUses = 0;
    let totalDiscountGiven = 0;
    let totalRevenueGenerated = 0;

    for (const offer of offers) {
      totalUses += offer.usages.length;
      totalDiscountGiven += offer.usages.reduce((sum, u) => sum + (Number(u.discountAmount) || 0), 0);
      totalRevenueGenerated += offer.usages.reduce((sum, u) => sum + (u.order ? Number(u.order.grandTotal) : 0), 0);
    }

    return {
      success: true,
      data: {
        totalCoupons,
        activeCoupons,
        totalUses,
        totalDiscountGiven,
        totalRevenueGenerated
      }
    };
  }

  async getOfferById(id: string | number) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: Number(id) },
      include: {
        categories: { include: { category: true } },
      }
    });
    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found.`);
    }
    return {
      ...offer,
      isActive: offer.status === 1
    };
  }

  async createOffer(data: any) {
    const { categoryIds, ...rest } = data;
    
    // Map status from isActive boolean if provided
    const status = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (Number(data.status) || 1);

    // Filter payload to only include valid Prisma fields for Offer
    const prismaData: any = {
      name: data.name,
      code: data.code,
      status: status,
      offerType: data.offerType || data.type || 'percentage',
      couponType: data.couponType || 'public',
      discountValue: Number(data.discountValue || 0),
      minCartAmount: data.minCartAmount ? Number(data.minCartAmount) : null,
      maxCartAmount: data.maxCartAmount ? Number(data.maxCartAmount) : null,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      maxUses: data.maxUses ? Number(data.maxUses) : null,
      usesPerCustomer: data.usesPerCustomer ? Number(data.usesPerCustomer) : null,
      startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      banner: data.banner,
      bannerButtonText: data.bannerButtonText,
      bannerButtonLink: data.bannerButtonLink,
      showAtStart: data.showAtStart ?? false,
      isAutoApply: data.isAutoApply ?? true,
      isStackable: data.isStackable ?? false,
      isExclusive: data.isExclusive ?? false,
    };

    try {
      const offer = await this.prisma.offer.create({
        data: {
          ...prismaData,
          categories: categoryIds ? {
            create: categoryIds.map((id: string) => ({
              category: { connect: { id: Number(id) } }
            }))
          } : undefined
        },
      });

      return { success: true, data: { ...offer, isActive: offer.status === 1 } };
    } catch (error) {
      console.error('Error creating offer:', error);
      return { success: false, error: error.message || 'Failed to create offer' };
    }
  }

  async updateOffer(id: string | number, data: any) {
    const { categoryIds, ...rest } = data;
    const offerId = Number(id);

    // Map status from isActive boolean if provided
    const status = data.isActive !== undefined ? (data.isActive ? 1 : 0) : (data.status !== undefined ? Number(data.status) : undefined);

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.code !== undefined) payload.code = data.code;
    if (status !== undefined) payload.status = status;
    if (data.offerType !== undefined || data.type !== undefined) payload.offerType = data.offerType || data.type;
    if (data.couponType !== undefined) payload.couponType = data.couponType;
    if (data.discountValue !== undefined) payload.discountValue = Number(data.discountValue);
    if (data.minCartAmount !== undefined) payload.minCartAmount = data.minCartAmount ? Number(data.minCartAmount) : null;
    if (data.maxCartAmount !== undefined) payload.maxCartAmount = data.maxCartAmount ? Number(data.maxCartAmount) : null;
    if (data.maxDiscount !== undefined) payload.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : null;
    if (data.maxUses !== undefined) payload.maxUses = data.maxUses ? Number(data.maxUses) : null;
    if (data.usesPerCustomer !== undefined) payload.usesPerCustomer = data.usesPerCustomer ? Number(data.usesPerCustomer) : null;
    if (data.startsAt !== undefined) payload.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) payload.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.banner !== undefined) payload.banner = data.banner;
    if (data.bannerButtonText !== undefined) payload.bannerButtonText = data.bannerButtonText;
    if (data.bannerButtonLink !== undefined) payload.bannerButtonLink = data.bannerButtonLink;
    if (data.showAtStart !== undefined) payload.showAtStart = data.showAtStart;
    if (data.isAutoApply !== undefined) payload.isAutoApply = data.isAutoApply;
    if (data.isStackable !== undefined) payload.isStackable = data.isStackable;
    if (data.isExclusive !== undefined) payload.isExclusive = data.isExclusive;

    // Handle nested categories update
    if (categoryIds) {
      await this.prisma.offerCategory.deleteMany({ where: { offerId } });
    }

    try {
      const offer = await this.prisma.offer.update({
        where: { id: offerId },
        data: {
          ...payload,
          categories: categoryIds ? {
            create: categoryIds.map((id: string) => ({
              category: { connect: { id: Number(id) } }
            }))
          } : undefined
        },
      });

      return { success: true, data: { ...offer, isActive: offer.status === 1 } };
    } catch (error) {
      console.error('Error updating offer:', error);
      return { success: false, error: error.message || 'Failed to update offer' };
    }
  }

  async deleteOffer(id: string | number) {
    await this.prisma.offer.delete({
      where: { id: Number(id) }
    });
    return { success: true };
  }

  // Calculate discount for an offer
  calculateDiscount(offer: any, cartAmount: number): number {
    let discount = 0;
    const amount = Number(cartAmount);

    if (offer.offerType === 'percentage') {
      discount = (amount * Number(offer.discountValue)) / 100;
      if (offer.maxDiscount) {
        discount = Math.min(discount, Number(offer.maxDiscount));
      }
    } else if (offer.offerType === 'fixed') {
      discount = Number(offer.discountValue);
    }

    return Math.min(discount, amount);
  }

  // Track coupon usage
  async trackUsage(offerId: number, customerId: number, orderId: number) {
    await this.prisma.$transaction([
      this.prisma.offerUsage.create({
        data: {
          offerId: offerId,
          customerId: customerId,
          orderId: orderId,
        },
      }),
      this.prisma.offer.update({
        where: { id: offerId },
        data: { usedCount: { increment: 1 } },
      }),
    ]);
  }
}


