import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderStatusHistoryService {
  constructor(private prisma: PrismaService) {}

  async logHistory(orderId: number, status: string, notes?: string, adminId?: string) {
    return this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        notes,
        adminId: adminId ? Number(adminId) : null,
      },
    });
  }

  async getHistory(orderId: number) {
    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}


