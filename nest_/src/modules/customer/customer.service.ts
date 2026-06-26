import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const ACTIVE_ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  private tonumberId(customerId: string) {
    try {
      return Number(customerId);
    } catch (e) {
      throw new BadRequestException(`Invalid customer ID: ${customerId}`);
    }
  }

  private getApiBaseUrl() {
    return process.env.APP_URL || `http://127.0.0.1:${process.env.PORT ?? 3001}`;
  }

  private toIsoString(value: Date | string | null | undefined) {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  private normalizeOrderStatus(status?: string | null) {
    const value = (status || '').toUpperCase();
    if (['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED'].includes(value)) {
      return value;
    }
    return 'PENDING';
  }

  private normalizePaymentStatus(status?: string | null) {
    const value = (status || '').toUpperCase();
    if (['PAID', 'PENDING', 'FAILED'].includes(value)) {
      return value;
    }
    return 'PENDING';
  }

  private toMediaUrl(path: string) {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }

    let normalized = path.replace(/\\/g, '/');
    if (normalized.startsWith('uploads/')) {
      normalized = '/' + normalized;
    } else if (!normalized.startsWith('/uploads/')) {
      normalized = normalized.startsWith('/') ? `/uploads${normalized}` : `/uploads/${normalized}`;
    }
    const prefix = normalized.startsWith('/') ? '' : '/';
    return `${this.getApiBaseUrl()}${prefix}${normalized}`;
  }

  private buildOrderPreview(order: any) {
    const firstItem = order.items?.[0];
    const variant = firstItem?.productVariant;
    const product = variant?.product;

    // 1. Try Variant Image
    let rawImg = variant?.variantImages?.find(vi => vi.type === 'MAIN')?.media?.filePath 
               || variant?.variantImages?.[0]?.media?.filePath;

    // 2. Try Product Gallery
    if (!rawImg && product?.images) {
      const prodImages = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images) : []);
      if (prodImages.length > 0) rawImg = prodImages[0];
    }

    // 3. Try Hero Image
    if (!rawImg) rawImg = product?.heroImage;

    return {
      title: firstItem?.productName || 'Product',
      image: this.toMediaUrl(rawImg),
    };
  }

  private mapOrderSummary(order: any) {
    return {
      id: order.id.toString(),
      orderNumber: order.orderNumber,
      createdAt: this.toIsoString(order.createdAt),
      grandTotal: Number(order.grandTotal || 0),
      status: this.normalizeOrderStatus(order.status),
      paymentStatus: this.normalizePaymentStatus(order.paymentStatus),
      preview: this.buildOrderPreview(order),
    };
  }

  private buildTracking(order: any) {
    if (!order) return null;

    return {
      orderId: order.id?.toString(),
      orderNumber: order.orderNumber,
      currentStatus: this.normalizeOrderStatus(order.status),
      timeline: [
        { label: 'Order Placed', date: this.toIsoString(order.createdAt), completed: true },
        { label: 'Confirmed', date: this.toIsoString(order.confirmedAt), completed: !!order.confirmedAt },
        { label: 'Processing', date: this.toIsoString(order.processingAt), completed: !!order.processingAt },
        { label: 'Shipped', date: this.toIsoString(order.shippedAt), completed: !!order.shippedAt },
        { label: 'Delivered', date: this.toIsoString(order.deliveredAt), completed: !!order.deliveredAt },
      ],
    };
  }

  private buildDashboardResponse(
    customer: any,
    allOrders: any[],
    totalOrders: number,
    activeOrders: number,
    totalSpent: number,
    wishlistCount: number,
  ) {
    const recentOrders = allOrders.slice(0, 5);
    const trackableOrders = allOrders
      .filter((order) => ACTIVE_ORDER_STATUSES.includes((order.status || '').toLowerCase()))
      .concat(allOrders.filter((order) => !ACTIVE_ORDER_STATUSES.includes((order.status || '').toLowerCase())));
    const defaultTrackingOrder = trackableOrders[0] || allOrders[0] || null;

    return {
      profile: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email || '',
        mobile: customer.mobile || null,
        address: customer.address || '',
        status: customer.status === 1 && !customer.isBlock ? 'ACTIVE' : 'INACTIVE',
        isBlock: !!customer.isBlock,
        createdAt: this.toIsoString(customer.createdAt),
        lastLoginAt: this.toIsoString(customer.lastLoginAt),
      },
      stats: {
        totalOrders,
        activeOrders,
        totalSpent,
        wishlistCount,
      },
      recentOrders: recentOrders.map((order) => this.mapOrderSummary(order)),
      orderHistory: allOrders.map((order) => this.mapOrderSummary(order)),
      trackingOrders: trackableOrders.map((order) => ({
        ...this.buildTracking(order),
        createdAt: this.toIsoString(order.createdAt),
        preview: this.buildOrderPreview(order),
      })),
      latestOrderTracking: this.buildTracking(defaultTrackingOrder),
    };
  }

  async getDashboard(customerId: string) {
    const cId = this.tonumberId(customerId);

    const customer = await this.prisma.customer.findUnique({
      where: { id: cId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const [allOrders, activeOrders, wishlistCount, totalSpentResult] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: cId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                  variantImages: {
                    include: {
                      media: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({
        where: {
          customerId: cId,
          status: { in: ACTIVE_ORDER_STATUSES },
        },
      }),
      this.prisma.wishlistItem.count({
        where: {
          wishlist: {
            customerId: cId,
          },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          customerId: cId,
          paymentStatus: 'paid',
        },
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    return this.buildDashboardResponse(
      customer,
      allOrders,
      allOrders.length,
      activeOrders,
      Number(totalSpentResult._sum.grandTotal || 0),
      wishlistCount,
    );
  }

  async getAddresses(customerId: string) {
    let cId: number;
    try {
      cId = Number(customerId);
    } catch (e) {
      return [];
    }
    return this.prisma.customerAddress.findMany({
      where: { customerId: cId },
    });
  }

  async addAddress(customerId: string, createAddressDto: CreateAddressDto) {
    const { isDefault, ...rest } = createAddressDto;
    const cId = this.tonumberId(customerId);

    const customer = await this.prisma.customer.findUnique({
      where: { id: cId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found. Please sign up or log in again.`);
    }

    if (isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: cId },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        ...rest,
        state: rest.state || 'Unknown',
        isDefault: isDefault ?? false,
        customerId: cId,
      },
    });
  }

  async updateAddress(customerId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    let cId: number;
    let aId: number;
    try {
      cId = Number(customerId);
      aId = Number(addressId);
    } catch (e) {
      throw new Error('Invalid ID format');
    }

    const address = await this.prisma.customerAddress.findUnique({
      where: { id: aId },
    });

    if (!address || address.customerId !== cId) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId: cId, NOT: { id: aId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: aId },
      data: updateAddressDto,
    });
  }

  async deleteAddress(customerId: string, addressId: string) {
    let cId: number;
    let aId: number;
    try {
      cId = Number(customerId);
      aId = Number(addressId);
    } catch (e) {
      throw new Error('Invalid ID format');
    }

    const address = await this.prisma.customerAddress.findUnique({
      where: { id: aId },
    });

    if (!address || address.customerId !== cId) {
      throw new NotFoundException('Address not found or unauthorized');
    }

    return this.prisma.customerAddress.delete({
      where: { id: aId },
    });
  }

  async getAddressById(customerId: string, addressId: string) {
    let cId: number;
    let aId: number;
    try {
      cId = Number(customerId);
      aId = Number(addressId);
    } catch (e) {
      throw new Error('Invalid ID format');
    }

    const address = await this.prisma.customerAddress.findUnique({
      where: { id: aId },
    });

    if (!address || address.customerId !== cId) {
      throw new NotFoundException('Address not found');
    }

    return address;
  }

  async getProfile(customerId: string) {
    const cId = this.tonumberId(customerId);

    const customer = await this.prisma.customer.findUnique({
      where: { id: cId },
      include: {
        _count: { select: { orders: true } },
        addresses: true,
        orders: {
          include: {
            addresses: true,
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const totalSpent = customer.orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, order) => sum + Number(order.grandTotal), 0);

    const { password: _, ...result } = customer;
    return { 
      ...result, 
      totalSpent,
      id: result.id.toString(),
      addresses: (result as any).addresses?.map(a => ({ ...a, id: a.id.toString(), orderId: a.orderId?.toString(), customerId: a.customerId?.toString() })),
      orders: (result as any).orders?.map(o => ({ 
        ...o, 
        id: o.id.toString(), 
        customerId: o.customerId?.toString(),
        addresses: o.addresses?.map(a => ({ ...a, id: a.id.toString(), orderId: a.orderId?.toString() }))
      }))
    };
  }

  async updateProfile(customerId: string, data: UpdateProfileDto) {
    const cId = this.tonumberId(customerId);

    if (data.mobile) {
      const existing = await this.prisma.customer.findUnique({
        where: { mobile: data.mobile },
      });
      if (existing && existing.id !== cId) {
        throw new BadRequestException('Mobile number already in use');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id: cId },
      data: {
        name: data.name,
        mobile: data.mobile || null,
        address: data.address || null,
      },
    });

    const { password: _, ...result } = updated as any;
    return {
      id: result.id.toString(),
      name: result.name,
      email: result.email || '',
      mobile: result.mobile || null,
      address: result.address || '',
      status: result.status === 1 && !result.isBlock ? 'ACTIVE' : 'INACTIVE',
      isBlock: !!result.isBlock,
      createdAt: this.toIsoString(result.createdAt),
      lastLoginAt: this.toIsoString(result.lastLoginAt),
    };
  }

  async getAllUsers() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          where: { paymentStatus: 'paid' },
          select: { grandTotal: true },
        },
      },
    });

    const mapped = customers.map(c => {
      const totalSpent = c.orders.reduce((sum, order) => sum + Number(order.grandTotal), 0);
      const { password: _, orders: __, ...rest } = c as any;
      return {
        ...rest,
        totalSpent,
        isActive: rest.status === 1 && !rest.isBlock,
        isBlocked: rest.isBlock,
      };
    });

    return {
      success: true,
      data: mapped,
    };
  }

  async updateCustomer(id: string | number, data: any) {
    const cId = Number(id);
    const updatePayload = { ...data };

    if (updatePayload.isActive !== undefined) {
      updatePayload.status = updatePayload.isActive ? 1 : 0;
      delete updatePayload.isActive;
    }

    if (updatePayload.isBlocked !== undefined) {
      updatePayload.isBlock = updatePayload.isBlocked;
      delete updatePayload.isBlocked;
    }

    const updated = await this.prisma.customer.update({
      where: { id: cId },
      data: updatePayload,
    });

    const { password: _, ...result } = updated as any;
    return { success: true, data: { ...result, isActive: result.status === 1, isBlocked: result.isBlock } };
  }

  async deleteCustomer(id: string | number) {
    const cId = Number(id);
    try {
      await this.prisma.customer.delete({
        where: { id: cId },
      });
      return { success: true, message: 'User deleted successfully' };
    } catch (e) {
      return { success: false, error: 'Cannot delete user: They have existing orders or linked data.' };
    }
  }
}


