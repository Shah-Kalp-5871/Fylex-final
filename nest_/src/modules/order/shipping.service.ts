import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateShipmentDto } from './dto/order.dto';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  // Create a shipment for an order
  async createShipment(orderId: string, dto: CreateShipmentDto) {
    const oId = Number(orderId);

    // 1. Validate order
    const order = await this.prisma.order.findUnique({
      where: { id: oId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    // 2. Create Shipment via Transaction
    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.orderShipment.create({
        data: {
          orderId: oId,
          trackingNumber: dto.trackingNumber,
          carrier: dto.carrier,
          carrierService: dto.carrierService,
          weight: dto.weight ? Number(dto.weight) : null,
          status: 'shipped',
          shippedAt: new Date(),
        },
      });

      // 3. Create Shipment Items
      for (const item of dto.items) {
        await tx.orderShipmentItem.create({
          data: {
            shipmentId: shipment.id,
            orderItemId: Number(item.orderItemId),
            quantity: item.quantity,
          },
        });
      }

      // 4. Update order shipping status
      await tx.order.update({
        where: { id: oId },
        data: { shippingStatus: 'shipped', shippedAt: new Date() },
      });

      return shipment;
    });
  }

  // Update shipment status
  async updateShipmentStatus(shipmentId: string, status: string) {
    const sId = Number(shipmentId);
    const shipment = await this.prisma.orderShipment.findUnique({ where: { id: sId } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    return this.prisma.orderShipment.update({
      where: { id: sId },
      data: { 
        status,
        deliveredAt: status === 'delivered' ? new Date() : undefined,
      },
    });
  }
}


