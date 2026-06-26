import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Res, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import { OrderService } from './order.service';
import { InvoiceService } from './invoice.service';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService
  ) { }

  @Post()
  async createOrder(@Body('customerId') customerId: string, @Body() createOrderDto: any) {
    return this.orderService.checkout(customerId, createOrderDto);
  }

  @Get()
  async getAllOrders(@Query('customerId') customerId?: string) {
    if (customerId) {
      return this.orderService.getOrders(customerId);
    }
    return this.orderService.getAllOrders();
  }

  // Static routes MUST come before :id param routes
  @Post('calculate-shipping')
  async calculateShipping(@Body('customerId') customerId: string, @Body('pincode') pincode: string) {
    return this.orderService.calculateShipping(customerId, pincode);
  }

  @Post('calculate-total')
  async calculateTotal(
    @Body('customerId') customerId: string, 
    @Body('pincode') pincode?: string,
    @Body('couponCode') couponCode?: string
  ) {
    return this.orderService.calculateOrderTotal(customerId, pincode, couponCode);
  }

  @Get(':id')
  async getOrderById(@Query('customerId') customerId: string, @Param('id') id: string) {
    return this.orderService.getOrderById(customerId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/invoice')
  async downloadInvoice(
    @Request() req: any,
    @Query('download') download: string,
    @Param('id') id: string,
    @Res() res: Response
  ) {
    // Verify access
    const orderRes = await this.orderService.getOrderById('', id);
    const order = orderRes.data;
    
    if (req.user.role !== 'ADMIN' && order.customerId !== req.user.id) {
      throw new ForbiddenException('You do not have access to this invoice');
    }
    
    // Generate PDF
    const pdfDoc = await this.invoiceService.generateInvoicePdf(id);
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    if (download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-ORD-${order.orderNumber || id}.pdf"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="Invoice-ORD-${order.orderNumber || id}.pdf"`);
    }
    
    // Pipe to response
    pdfDoc.pipe(res);
  }

  // Update order status (used by admin)
  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: string, @Body('notes') notes?: string) {
    return this.orderService.updateStatus(id, status, notes);
  }

  // Update payment status (used by admin)
  @Put(':id/payment-status')
  async updatePaymentStatus(@Param('id') id: string, @Body('payment_status') paymentStatus: string, @Body('notes') notes?: string) {
    return this.orderService.updatePaymentStatus(id, paymentStatus, notes);
  }

  // Legacy: also allow PUT :id for backwards compatibility
  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }

  @Post(':id/cancel')
  async cancelOrder(@Body('customerId') customerId: string, @Param('id') id: string, @Body('reason') reason: string) {
    return this.orderService.cancelOrder(customerId, id, reason);
  }

  @Post(':id/tracking')
  async updateTracking(@Param('id') id: string, @Body() trackingData: any) {
    return this.orderService.updateTracking(id, trackingData);
  }

  @Post(':id/refund')
  async processRefund(@Param('id') id: string, @Body() refundData: any) {
    return this.orderService.processRefund(id, refundData);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}


