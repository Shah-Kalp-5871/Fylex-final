import { Injectable, BadRequestException } from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private razorpay: any;

  constructor() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
      console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from .env');
    }

    this.razorpay = new Razorpay({
      key_id: key_id || '',
      key_secret: key_secret || '',
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit
      currency,
      receipt,
    };

    console.log('Initiating Razorpay order:', options);

    try {
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay order created:', order.id);
      return order;
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      const message = error.description || error.error?.description || error.message || 'Razorpay order creation failed';
      throw new BadRequestException(`Razorpay Error: ${message}`);
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string) {
    const text = `${orderId}|${paymentId}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }
}


