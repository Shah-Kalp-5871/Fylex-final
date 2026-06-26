import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { OrderService } from '../order/order.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderService: OrderService
  ) {}

  @Post('create-order')
  async createOrder(@Body() body: { customerId: string; pincode?: string; receipt: string; couponCode?: string }) {
    if (!body.customerId) throw new BadRequestException('customerId is required');
    
    // SECURITY: Calculate total on server, do NOT trust frontend amount
    const totals = await this.orderService.calculateOrderTotal(body.customerId, body.pincode, body.couponCode);
    if (totals.total <= 0) throw new BadRequestException('Invalid order total');
    
    return this.paymentService.createOrder(totals.total, 'INR', body.receipt);
  }

  @Post('verify')
  async verifyPayment(
    @Body() body: { orderId: string; paymentId: string; signature: string },
  ) {
    const isValid = this.paymentService.verifySignature(
      body.orderId,
      body.paymentId,
      body.signature,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }
    return { success: true };
  }
}


