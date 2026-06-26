import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LoyaltyService {
  constructor(private prisma: PrismaService) {}

  // Get or Create loyalty account for customer
  private async getOrCreateLoyalty(customerId: number) {
    let loyalty = await this.prisma.customerLoyalty.findFirst({
      where: { customerId: customerId },
    });

    if (!loyalty) {
      // Find default active loyalty program
      const program = await this.prisma.loyaltyProgram.findFirst({
        where: { status: 1 },
      });
      if (!program) {
        throw new NotFoundException('No active loyalty program found');
      }

      loyalty = await this.prisma.customerLoyalty.create({
        data: {
          customer: { connect: { id: customerId } },
          loyaltyProgram: { connect: { id: program.id } },
          availablePoints: 0,
          totalPoints: 0,
        },
      });
    }
    return loyalty;
  }

  // Earn points on purchase
  async earnPoints(customerId: number, orderId: number, amount: number) {
    const loyalty = await this.getOrCreateLoyalty(customerId);
    const pointsRatio = 1; // Example: 1 point per 1 unit of currency spent
    const pointsEarned = Math.floor(amount * pointsRatio);

    await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          customerLoyaltyId: loyalty.id,
          customerId: customerId,
          type: 'earning',
          points: pointsEarned,
          balance: Number(loyalty.availablePoints) + pointsEarned,
          referenceType: 'order',
          referenceId: orderId,
          notes: 'Points earned on order purchase',
        },
      }),
      this.prisma.customerLoyalty.update({
        where: { id: loyalty.id },
        data: {
          availablePoints: { increment: pointsEarned },
          totalPoints: { increment: pointsEarned },
        },
      }),
    ]);

    return pointsEarned;
  }

  // Spend points on checkout
  async spendPoints(customerId: number, pointsNeeded: number, orderId?: number) {
    const loyalty = await this.getOrCreateLoyalty(customerId);

    if (Number(loyalty.availablePoints) < pointsNeeded) {
      throw new Error('Insufficient loyalty points');
    }

    await this.prisma.$transaction([
      this.prisma.loyaltyTransaction.create({
        data: {
          customerLoyaltyId: loyalty.id,
          customerId: customerId,
          type: 'redemption',
          points: -pointsNeeded,
          balance: Number(loyalty.availablePoints) - pointsNeeded,
          referenceType: orderId ? 'order' : undefined,
          referenceId: orderId,
          notes: 'Points spent on checkout',
        },
      }),
      this.prisma.customerLoyalty.update({
        where: { id: loyalty.id },
        data: {
          availablePoints: { decrement: pointsNeeded },
          usedPoints: { increment: pointsNeeded },
        },
      }),
    ]);

    return true;
  }

  // Get current balance
  async getLoyaltyBalance(customerId: string) {
    const cId = Number(customerId);
    return this.getOrCreateLoyalty(cId);
  }
}


