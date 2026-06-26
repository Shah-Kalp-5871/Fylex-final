import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CheckoutDto } from './dto/order.dto';
import { Prisma } from '@prisma/client';
import { MarketingService } from '../marketing/marketing.service';
import { LoyaltyService } from '../marketing/loyalty.service';
import { OrderStatusHistoryService } from './order-status-history.service';
import { ShiprocketService } from './shiprocket.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private prisma: PrismaService,
    private marketingService: MarketingService,
    private loyaltyService: LoyaltyService,
    private historyService: OrderStatusHistoryService,
    private shiprocketService: ShiprocketService,
  ) { }

  // Create order from cart (Checkout)
  async checkout(customerId: string, dto: CheckoutDto) {
    const customerIdStr = customerId?.toString() || '';
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
    const cId = isNumeric ? Number(customerIdStr) : null;

    // 1. Get active cart
    const cart = await this.prisma.cart.findFirst({
      where: cId ? { customerId: cId, status: 'active' } : { sessionId: customerIdStr, status: 'active' },
      include: {
        items: {
          include: {
            productVariant: { include: { product: true } }
          }
        },
        customer: true,
        offer: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Validate Coupon
    let appliedOffer = cart.offer;
    if (dto.couponCode) {
      appliedOffer = await this.marketingService.validateCoupon(customerId, dto.couponCode, Number(cart.subtotal));
    }

    // 3. Handle Loyalty Points Redemption
    let pointDiscount = 0;
    if (dto.redeemPoints && dto.redeemPoints > 0) {
      const balance = await this.loyaltyService.getLoyaltyBalance(customerId);
      if (Number(balance.availablePoints) < dto.redeemPoints) {
        throw new BadRequestException('Insufficient loyalty points');
      }
      pointDiscount = dto.redeemPoints / 100;
    }

    // 4. Validate Addresses
    const shippingAddr = await this.prisma.customerAddress.findUnique({
      where: { id: Number(dto.shippingAddressId) },
    });
    if (!shippingAddr || shippingAddr.customerId !== cId) {
      throw new BadRequestException('Invalid shipping address');
    }

    // 5. Pre-flight Stock Validation
    for (const item of cart.items) {
      const variant = item.productVariant;
      if (variant && variant.manageStock) {
        if (!variant.inStock || variant.qty < item.quantity) {
          throw new BadRequestException(`Item "${variant.product?.name || variant.sku}" is out of stock or requested quantity exceeds available stock.`);
        }
      }
    }

    // 6. Create Order via Transaction
    return this.prisma.$transaction(async (tx) => {
      const subtotal = Number(cart.subtotal);
      const discountAmount = appliedOffer ? this.marketingService.calculateDiscount(appliedOffer, subtotal) : 0;
      const totalDiscount = discountAmount + pointDiscount;
      const grandTotal = Math.max(0, subtotal - totalDiscount);
      const pointsEarned = Math.floor(grandTotal);

      // a. Create the Order
      // Calculate Total Weight (Default to 0.5kg per watch if not specified)
      let totalWeight = 0;
      for (const item of cart.items) {
        const itemWeight = item.productVariant.weight ? Number(item.productVariant.weight) : 0.4;
        totalWeight += itemWeight * item.quantity;
      }

      const isCod = dto.paymentMethod === 'cod';
      let shippingTotal = 500; // Default fallback

      try {
        const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '380001';
        const rateData = await this.shiprocketService.checkServiceability(
          pickupPincode,
          shippingAddr.pincode,
          totalWeight
        );

        if (rateData.serviceable === false) {
          this.logger.warn(`Unserviceable pincode: ${shippingAddr.pincode} for customer ${customerId}`);
          throw new BadRequestException('Delivery is not available for this location');
        }

        if (isCod && rateData.codAvailable === false) {
          this.logger.warn(`COD Unavailable for pincode: ${shippingAddr.pincode} for customer ${customerId}`);
          throw new BadRequestException('Cash on Delivery is not available for this location');
        }

        if (rateData.serviceable === null) {
          this.logger.error(`Technical failure in shipping API for pincode: ${shippingAddr.pincode}`);
        }

        shippingTotal = rateData.rate ?? 500;
      } catch (e) {
        if (e instanceof BadRequestException) throw e;
        this.logger.error(`Shiprocket rate calculation failed: ${e.message}`);
        shippingTotal = 500;
      }

      const isOnline = dto.paymentMethod === 'online';

      const order = await tx.order.create({
        data: {
          customer: cId ? { connect: { id: cId } } : undefined,
          offer: appliedOffer ? { connect: { id: appliedOffer.id } } : undefined,
          status: 'pending',
          paymentStatus: isOnline ? 'paid' : 'pending',
          shippingStatus: 'pending',
          paymentMethod: dto.paymentMethod || 'cod',
          subtotal: Number(subtotal),
          shippingTotal: Number(shippingTotal),
          taxTotal: Number(0),
          discountTotal: Number(totalDiscount),
          grandTotal: Number(Math.max(0, subtotal + shippingTotal - totalDiscount)),
          customerNote: dto.notes,
          customerFirstName: cart.customer?.name?.split(' ')[0] || 'Customer',
          customerLastName: cart.customer?.name?.split(' ')?.slice(1)?.join(' ') || 'Name',
          customerMobile: cart.customer?.mobile || '',
          customerDob: dto.dob ? new Date(dto.dob) : (cart.customer?.dob || null),
          orderNumber: `ORD-${Date.now()}`,
          loyaltyPointsUsed: Number(dto.redeemPoints || 0),
          loyaltyPointsEarned: Number(pointsEarned),
          createdAt: new Date(),
        },
      });

      // a1. Update Customer Profile with DOB if provided
      if (dto.dob) {
        await tx.customer.update({
          where: { id: cId },
          data: { dob: new Date(dto.dob) },
        });
      }

      // a2. Create Payment record if online
      if (isOnline && dto.paymentId) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod: 'online',
            paymentGateway: 'razorpay',
            transactionId: dto.paymentId,
            amount: order.grandTotal,
            status: 'paid',
            paidAt: new Date(),
          }
        });
      }

      // b. Log History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'pending',
          notes: 'Order placed by customer',
        }
      });

      // c. Snapshot Addresses
      await tx.orderAddress.create({
        data: {
          order: { connect: { id: order.id } },
          type: 'shipping',
          firstName: shippingAddr.name?.split(' ')[0] || 'Customer',
          lastName: shippingAddr.name?.split(' ')?.slice(1)?.join(' ') || 'Name',
          email: cart.customer?.email || '',
          phone: shippingAddr.mobile,
          address1: shippingAddr.address,
          city: shippingAddr.city,
          state: shippingAddr.state,
          postcode: shippingAddr.pincode,
          country: shippingAddr.country,
        },
      });

      // d. Create Items and Deduct Stock
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            order: { connect: { id: order.id } },
            product: { connect: { id: item.productVariant.productId } },
            productVariant: { connect: { id: item.productVariantId } },
            productName: item.productVariant.product?.name || 'Product',
            sku: item.productVariant.sku || 'SKU',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.total,
            total: item.total,
            discountAmount: Number(0),
            attributes: item.attributes as any,
          },
        });

        // Deduct inventory
        const variant = item.productVariant;
        if (variant && variant.manageStock) {
          const newQty = Math.max(0, variant.qty - item.quantity);
          const newInStock = newQty > 0;
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { 
              qty: newQty, 
              inStock: newInStock,
              stockStatus: newInStock ? 'instock' : 'outofstock'
            }
          });
        }
      }

      // e. Track Marketing Usage
      if (appliedOffer && cId) {
        await tx.offerUsage.create({
          data: {
            offerId: appliedOffer.id,
            customerId: cId,
            orderId: order.id,
            discountAmount: Number(discountAmount),
          }
        });
        await tx.offer.update({
          where: { id: appliedOffer.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // f. Spend Points
      if (dto.redeemPoints && dto.redeemPoints > 0 && cId) {
        const loyalty = await tx.customerLoyalty.findFirst({ where: { customerId: cId } });
        if (loyalty) {
          await tx.loyaltyTransaction.create({
            data: {
              customerLoyaltyId: loyalty.id,
              customerId: cId,
              type: 'redemption',
              points: -dto.redeemPoints,
              balance: Number(loyalty.availablePoints) - dto.redeemPoints,
              referenceType: 'order',
              referenceId: order.id,
              notes: 'Spend on checkout',
            }
          });
          await tx.customerLoyalty.update({
            where: { id: loyalty.id },
            data: {
              availablePoints: { decrement: dto.redeemPoints },
              usedPoints: { increment: dto.redeemPoints },
            }
          });
        }
      }

      // g. Clear Cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          status: 'completed',
          subtotal: 0,
          grandTotal: 0,
          offerId: null,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
              productVariant: {
                include: {
                  variantImages: {
                    include: {
                      media: true
                    }
                  },
                  variantAttributes: {
                    include: {
                      attributeValue: {
                        include: {
                          attribute: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
    });
  }

  // Update Status (Admin)
  async updateStatus(orderId: string, status: string, notes?: string, adminId?: string) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({ where: { id: oId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: oId },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: oId, status, notes, adminId: adminId ? Number(adminId) : null },
      });

      return { success: true, data: updatedOrder };
    });
  }

  // Update Payment Status (Admin)
  async updatePaymentStatus(orderId: string, paymentStatus: string, notes?: string) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({ where: { id: oId } });
    if (!order) throw new NotFoundException('Order not found');

    const updatedOrder = await this.prisma.order.update({
      where: { id: oId },
      data: { paymentStatus },
    });

    return { success: true, data: updatedOrder };
  }

  // Cancel Order (Customer)
  async cancelOrder(customerId: string, orderId: string, reason: string) {
    const cId = Number(customerId);
    const oId = Number(orderId);

    const order = await this.prisma.order.findUnique({
      where: { id: oId },
      include: { customer: true }
    });

    if (!order || order.customerId !== cId) throw new NotFoundException('Order not found');
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled in its current state');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: oId },
        data: {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
        }
      });

      await tx.orderStatusHistory.create({
        data: { orderId: oId, status: 'cancelled', notes: `Cancelled by customer: ${reason}` },
      });

      // Refund Loyalty Points if used
      if (order.loyaltyPointsUsed && order.loyaltyPointsUsed > 0) {
        const points = order.loyaltyPointsUsed;
        const loyalty = await tx.customerLoyalty.findFirst({ where: { customerId: cId } });
        if (loyalty) {
          await tx.loyaltyTransaction.create({
            data: {
              customerLoyaltyId: loyalty.id,
              customerId: cId,
              type: 'refund',
              points: points,
              balance: Number(loyalty.availablePoints) + points,
              referenceType: 'order',
              referenceId: oId,
              notes: 'Points refunded due to cancellation',
            }
          });
          await tx.customerLoyalty.update({
            where: { id: loyalty.id },
            data: {
              availablePoints: { increment: points },
              usedPoints: { decrement: points },
            }
          });
        }
      }

      return updatedOrder;
    });
  }

  // Delete Order (Admin)
  async deleteOrder(orderId: string) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({ where: { id: oId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx) => {
      // Clean up dependencies
      await tx.orderItem.deleteMany({ where: { orderId: oId } });
      await tx.orderAddress.deleteMany({ where: { orderId: oId } });
      await tx.orderStatusHistory.deleteMany({ where: { orderId: oId } });
      await tx.payment.deleteMany({ where: { orderId: oId } });
      
      const deletedOrder = await tx.order.delete({ where: { id: oId } });
      return { success: true, data: deletedOrder };
    });
  }

  // Get all orders (Admin)
  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: {
          select: { name: true, email: true }
        },
        shipments: true,
        returns: true,
        statusHistory: { orderBy: { createdAt: 'desc' } }
      },
    });
    return { success: true, data: orders };
  }

  // Get orders for a specific customer
  async getOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId: Number(customerId) },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
            productVariant: {
              include: {
                variantImages: {
                  include: {
                    media: true
                  }
                },
                variantAttributes: {
                  include: {
                    attributeValue: {
                      include: {
                        attribute: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });
    return { success: true, data: orders };
  }

  async getOrderById(customerId: string, orderId: string) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({
      where: { id: oId },
      include: {
        items: {
          include: {
            product: true,
            productVariant: {
              include: {
                variantImages: {
                  include: {
                    media: true
                  }
                },
                variantAttributes: {
                  include: {
                    attributeValue: {
                      include: {
                        attribute: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        addresses: true,
        customer: { select: { id: true, name: true, email: true, mobile: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        shipments: true,
        returns: true
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Security check: If customerId is provided, verify ownership
    if (customerId) {
      const customerIdStr = customerId.toString();
      const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
      const cId = isNumeric ? Number(customerIdStr) : null;

      if (cId && order.customerId !== cId) {
        throw new NotFoundException('Order not found');
      }
    }

    return { success: true, data: order };
  }

  async calculateOrderTotal(customerId: string, pincode?: string, couponCode?: string) {
    const customerIdStr = customerId?.toString() || '';
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
    const cId = isNumeric ? Number(customerIdStr) : null;

    const cart = await this.prisma.cart.findFirst({
      where: cId ? { customerId: cId, status: 'active' } : { sessionId: customerIdStr, status: 'active' },
      include: { items: { include: { productVariant: true } }, offer: true }
    });

    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 };
    }

    const subtotal = cart.subtotal ? Number(cart.subtotal) : 0;
    let shippingTotal = 0;
    let message = '';

    if (pincode && pincode.length === 6) {
      try {
        const rateData = await this.calculateShipping(customerId, pincode);
        shippingTotal = rateData.rate ?? 500;
        message = rateData.message || '';
      } catch (e) {
        this.logger.error(`Error calculating shipping in total: ${e.message}`);
        shippingTotal = 500;
      }
    }

    let discount = 0;
    let appliedOffer = cart.offer;

    let couponError = null;

    if (couponCode) {
      try {
        appliedOffer = await this.marketingService.validateCoupon(customerId, couponCode, subtotal);
      } catch (e) {
        this.logger.error(`Invalid coupon: ${e.message}`);
        appliedOffer = null; // Ignore invalid coupon
        couponError = e.message;
      }
    }

    if (appliedOffer) {
      discount = this.marketingService.calculateDiscount(appliedOffer, subtotal);
    }

    return {
      subtotal,
      shipping: shippingTotal,
      tax: 0,
      discount,
      total: Math.max(0, subtotal + shippingTotal - discount),
      message,
      couponError
    };
  }

  async calculateShipping(customerId: string, pincode: string) {
    const customerIdStr = customerId?.toString() || '';
    const isNumeric = !isNaN(Number(customerIdStr)) && !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
    const cId = isNumeric ? Number(customerIdStr) : null;

    const cart = await this.prisma.cart.findFirst({
      where: cId ? { customerId: cId, status: 'active' } : { sessionId: customerIdStr, status: 'active' },
      include: { items: { include: { productVariant: true } } }
    });

    if (!cart || cart.items.length === 0) return { serviceable: false, rate: null, message: "Cart is empty" };

    let totalWeight = 0;
    for (const item of cart.items) {
      const itemWeight = item.productVariant.weight ? Number(item.productVariant.weight) : 0.4;
      totalWeight += itemWeight * item.quantity;
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || '380001';
    const rateData = await this.shiprocketService.checkServiceability(
      pickupPincode,
      pincode,
      totalWeight
    );

    return rateData;
  }

  // Update Tracking (Admin)
  async updateTracking(orderId: string, trackingData: any) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({ where: { id: oId }, include: { shipments: true } });
    if (!order) throw new NotFoundException('Order not found');

    const { carrier, trackingNumber, trackingUrl } = trackingData;

    return this.prisma.$transaction(async (tx) => {
      let shipment;
      if (order.shipments && order.shipments.length > 0) {
        shipment = await tx.orderShipment.update({
          where: { id: order.shipments[0].id },
          data: { carrier, trackingNumber, trackingUrl }
        });
      } else {
        shipment = await tx.orderShipment.create({
          data: {
            orderId: oId,
            carrier,
            trackingNumber,
            trackingUrl,
            status: 'shipped'
          }
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: oId,
          status: order.status,
          notes: `Tracking updated: ${carrier || ''} ${trackingNumber || ''}`
        }
      });

      return { success: true, data: shipment };
    });
  }

  // Process Refund (Admin)
  async processRefund(orderId: string, refundData: any) {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({ where: { id: oId } });
    if (!order) throw new NotFoundException('Order not found');

    const { amount, reason } = refundData;

    return this.prisma.$transaction(async (tx) => {
      const orderReturn = await tx.orderReturn.create({
        data: {
          returnNumber: `RET-${Date.now()}`,
          orderId: oId,
          status: 'processed',
          type: 'refund',
          refundAmount: Number(amount),
          reason: reason || 'Manual Admin Refund'
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: oId,
          status: order.status,
          notes: `Partial refund processed: ₹${amount}. Reason: ${reason || 'N/A'}`
        }
      });

      return { success: true, data: orderReturn };
    });
  }
}


