import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MarketingModule } from '../marketing/marketing.module';
import { OrderStatusHistoryService } from './order-status-history.service';
import { ShippingService } from './shipping.service';
import { ShiprocketService } from './shiprocket.service';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [PrismaModule, MarketingModule],
  controllers: [OrderController],
  providers: [OrderService, OrderStatusHistoryService, ShippingService, ShiprocketService, InvoiceService],
  exports: [OrderService, OrderStatusHistoryService, ShippingService, ShiprocketService, InvoiceService],
})
export class OrderModule {}


