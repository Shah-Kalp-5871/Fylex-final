import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { Prisma } from '@prisma/client';
import { MarketingService } from '../marketing/marketing.service';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private marketingService: MarketingService,
  ) {}

  // Get or Create active cart for customer
  private async getOrCreateCart(customerId: string | number | number) {
    if (!customerId || customerId === 'undefined' || customerId === 'null' || customerId === '') {
      return { id: Number(0), items: [] as any[], subtotal: Number(0), discountTotal: Number(0), grandTotal: Number(0) };
    }

    const customerIdStr = customerId.toString();
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_');
    
    let cart = await this.prisma.cart.findFirst({
      where: isNumeric 
        ? { customerId: Number(customerIdStr), status: 'active' }
        : { sessionId: customerIdStr, status: 'active' },
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true, 
                variantAttributes: { 
                  include: { 
                    attributeValue: { 
                      include: { 
                        attribute: true 
                      } 
                    } 
                  } 
                }, 
                variantImages: { 
                  include: { 
                    media: true 
                  } 
                } 
              } 
            },
            belt: { include: { image: true } }
          },
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
          ]
        } 
      },
    });

    if (!cart) {
      try {
        if (isNumeric) {
          cart = await this.prisma.cart.create({
            data: {
              customer: { connect: { id: Number(customerIdStr) } },
              status: 'active',
            },
            include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true, 
                variantAttributes: { 
                  include: { 
                    attributeValue: { 
                      include: { 
                        attribute: true 
                      } 
                    } 
                  } 
                }, 
                variantImages: { 
                  include: { 
                    media: true 
                  } 
                } 
              } 
            },
            belt: { include: { image: true } }
          },
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
          ]
        } 
      },
          });
        } else {
          cart = await this.prisma.cart.create({
            data: {
              sessionId: customerIdStr,
              status: 'active',
            },
            include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true, 
                variantAttributes: { 
                  include: { 
                    attributeValue: { 
                      include: { 
                        attribute: true 
                      } 
                    } 
                  } 
                }, 
                variantImages: { 
                  include: { 
                    media: true 
                  } 
                } 
              } 
            },
            belt: { include: { image: true } }
          },
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' }
          ]
        } 
      },
          });
        }
      } catch (err) {
        // Fallback for non-existent numeric users: treat as session
        cart = await this.prisma.cart.create({
          data: {
            sessionId: customerIdStr,
            status: 'active',
          },
          include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true, 
                variantAttributes: { 
                  include: { 
                    attributeValue: { 
                      include: { 
                        attribute: true 
                      } 
                    } 
                  } 
                }, 
                variantImages: { 
                  include: { 
                    media: true 
                  } 
                } 
              } 
            },
            belt: { include: { image: true } }
          },
          orderBy: { createdAt: 'asc' }
        } 
      },
        });
      }
    }
    return cart;
  }

  // Get current cart
  async getCart(customerId: string) {
    return this.getOrCreateCart(customerId);
  }

  // Apply a coupon code
  async applyCoupon(customerId: string, code: string) {
    const cart = await this.getOrCreateCart(customerId);
    
    // 1. Validate the coupon
    const offer = await this.marketingService.validateCoupon(customerId, code, Number(cart.subtotal));

    // 2. Associate the offer with the cart
    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { offerId: offer.id },
    });

    // 3. Recalculate totals
    await this.updateCartTotals(cart.id);
    
    return { success: true, message: 'Coupon applied successfully' };
  }

  // Add item to cart
  async addItem(customerId: string, dto: AddToCartDto) {
    try {
      if (!dto.variantId) throw new BadRequestException('variantId is mandatory for all cart operations');
      const cart = await this.getOrCreateCart(customerId);
      const isBelt = String(dto.variantId).startsWith('belt-');

      if (isBelt) {
        const beltId = Number(String(dto.variantId).replace('belt-', ''));
        const belt = await this.prisma.belt.findUnique({ where: { id: beltId } });
        if (!belt) throw new NotFoundException('Belt not found');

        const existingItem = (cart.items as any[]).find((item) => item.beltId === beltId);
        if (existingItem) {
          return this.updateItem(customerId, existingItem.id.toString(), {
            userId: customerId,
            quantity: existingItem.quantity + dto.quantity,
          });
        }

        await this.prisma.cartItem.create({
          data: {
            cart: { connect: { id: cart.id } },
            belt: { connect: { id: beltId } },
            quantity: dto.quantity,
            unitPrice: belt.price || Number(0),
            total: Number((belt.price || 0) * dto.quantity),
          },
        });
        await this.updateCartTotals(cart.id);
        return this.getCart(customerId);
      }

      const variantId = Number(dto.variantId);

      // Validate variant exists
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }

      // Check if item already in cart
      const existingItem = (cart.items as any[]).find((item) => item.productVariantId === variantId);

      if (existingItem) {
        return this.updateItem(customerId, existingItem.id.toString(), {
          userId: customerId,
          quantity: existingItem.quantity + dto.quantity,
        });
      }

      // Validate stock for new item
      if (variant.manageStock) {
        if (!variant.inStock || variant.qty < dto.quantity) {
          throw new BadRequestException(`Not enough stock available for this item.`);
        }
      }

      // Create new item
      const newItem = await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          productVariant: { connect: { id: variantId } },
          quantity: dto.quantity,
          unitPrice: variant.price || Number(0),
          total: Number((variant.price || 0) * dto.quantity),
        },
      });

      await this.updateCartTotals(cart.id);
      return this.getCart(customerId);
    } catch (err) {
      console.error('CRITICAL ERROR in addItem:', err);
      throw err;
    }
  }

  // Update item quantity
  async updateItem(customerId: string, itemId: string, dto: UpdateCartItemDto) {
    const iId = Number(itemId);
    
    const item = await this.prisma.cartItem.findUnique({
      where: { id: iId },
      include: { cart: true },
    });

    const customerIdStr = customerId.toString();
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
    
    const ownerMatch = isNumeric 
      ? (item && item.cart.customerId === Number(customerIdStr))
      : (item && item.cart.sessionId === customerIdStr);

    if (!item || !ownerMatch) {
      throw new NotFoundException('Cart item not found');
    }

    if (item.productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: item.productVariantId }
      });
      
      if (variant && variant.manageStock) {
        if (!variant.inStock || variant.qty < dto.quantity) {
          throw new BadRequestException(`Not enough stock available. Maximum available is ${variant.qty}.`);
        }
      }
    } else if (item.beltId) {
      const belt = await this.prisma.belt.findUnique({
        where: { id: item.beltId }
      });
      
      if (belt && belt.stock < dto.quantity) {
        throw new BadRequestException(`Not enough stock available. Maximum available is ${belt.stock}.`);
      }
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: iId },
      data: {
        quantity: dto.quantity,
        total: Number((item.unitPrice || 0) * dto.quantity),
      },
    });

    await this.updateCartTotals(item.cartId);
    return this.getCart(customerId);
  }

  // Remove item
  async removeItem(customerId: string, itemId: string) {
    const iId = Number(itemId);
    const item = await this.prisma.cartItem.findUnique({
      where: { id: iId },
      include: { cart: true },
    });

    const customerIdStr = customerId.toString();
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_') && customerIdStr !== '';
    
    const ownerMatch = isNumeric 
      ? (item && item.cart.customerId === Number(customerIdStr))
      : (item && item.cart.sessionId === customerIdStr);

    if (!item || !ownerMatch) {
      throw new NotFoundException('Cart item not found');
    }

    const cartId = item.cartId;
    await this.prisma.cartItem.delete({ where: { id: iId } });
    await this.updateCartTotals(cartId);
    return this.getCart(customerId);
  }

  // Clear cart
  async clearCart(customerId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { customerId: Number(customerId), status: 'active' },
    });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { offerId: null },
      });
      await this.updateCartTotals(cart.id);
    }
    return this.getCart(customerId);
  }

  // Recalculate totals
  private async updateCartTotals(cartId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true, offer: true },
    });

    if (!cart) return;

    const subtotal = cart.items.reduce((sum, item) => sum + (item.total || 0), 0);
    let discount = 0;

    if (cart.offerId && cart.offer) {
       discount = this.marketingService.calculateDiscount(cart.offer, subtotal);
    }

    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: Number(subtotal),
        discountTotal: Number(discount),
        grandTotal: Number(subtotal - discount),
      },
    });
  }
}


