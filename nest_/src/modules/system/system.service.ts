import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    const [
      totalOrders,
      totalOrdersLastMonth,
      totalCustomers,
      totalCustomersLastMonth,
      totalProducts,
      totalProductsLastMonth,
      revenueResult,
      revenueResultLastMonth,
      todayOrders,
      yesterdayOrders,
      todayRevenue,
      yesterdayRevenue,
      pendingOrders,
      lowStockCount,
      outOfStockCount,
      recentOrders,
      recentCustomers,
      statusGroups,
      topProductsRaw
    ] = await Promise.all([
      // Total Counts
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),

      // Revenue
      this.prisma.order.aggregate({ where: { paymentStatus: 'paid' }, _sum: { grandTotal: true } }),
      this.prisma.order.aggregate({ where: { paymentStatus: 'paid', createdAt: { gte: startOfLastMonth, lt: startOfMonth } }, _sum: { grandTotal: true } }),

      // Daily stats
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfToday } } }),
      this.prisma.order.aggregate({ where: { paymentStatus: 'paid', createdAt: { gte: startOfToday } }, _sum: { grandTotal: true } }),
      this.prisma.order.aggregate({ where: { paymentStatus: 'paid', createdAt: { gte: startOfYesterday, lt: startOfToday } }, _sum: { grandTotal: true } }),

      // Specific metrics
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.productVariant.count({ where: { qty: { gt: 0, lt: 10 } } }),
      this.prisma.productVariant.count({ where: { qty: 0 } }),

      // Lists
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { name: true } } }
      }),
      this.prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),

      // Distributions
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Top Products (simplified bestsellers)
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        _sum: { total: true },
        take: 5,
        orderBy: { _count: { productId: 'desc' } }
      })
    ]);

    // Format Top Products
    const topProducts = await Promise.all(topProductsRaw.map(async (item) => {
      // item.productId could be null from groupBy, but we filter or handle it
      if (item.productId === null) return null;
      
      const product = await this.prisma.product.findUnique({ 
        where: { id: item.productId },
        select: { name: true, price: true }
      });
      return {
        name: product?.name || 'Unknown',
        sales: item._count.productId,
        revenue: Number(item._sum.total || 0),
        price: Number(product?.price || 0)
      };
    }));

    // Filter out any potential nulls from topProducts if we had them
    const validTopProducts = topProducts.filter((p): p is NonNullable<typeof p> => p !== null);

    // Helper for percentage change
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const stats = {
      total_revenue: Number(revenueResult._sum?.grandTotal || 0),
      revenue_change: calculateChange(Number(revenueResult._sum?.grandTotal || 0), Number(revenueResultLastMonth._sum?.grandTotal || 0)),
      total_orders: totalOrders,
      orders_change: calculateChange(totalOrders, totalOrdersLastMonth),
      total_products: totalProducts,
      products_change: calculateChange(totalProducts, totalProductsLastMonth),
      total_customers: totalCustomers,
      customers_change: calculateChange(totalCustomers, totalCustomersLastMonth),
      today_orders: todayOrders,
      yesterday_orders: yesterdayOrders,
      today_revenue: Number(todayRevenue._sum?.grandTotal || 0),
      yesterday_revenue: Number(yesterdayRevenue._sum?.grandTotal || 0),
      pending_orders: pendingOrders,
      low_stock_products: lowStockCount,
      out_of_stock_products: outOfStockCount,
    };

    const orderStatusDistribution = {};
    statusGroups.forEach(g => {
      orderStatusDistribution[g.status] = g._count.id;
    });

    // Real weekly revenue for chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const revenueChartDataRaw = await Promise.all(last7Days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const res = await this.prisma.order.aggregate({
        where: {
          createdAt: { gte: day, lt: nextDay },
          paymentStatus: 'paid'
        },
        _sum: { grandTotal: true }
      });
      return Number(res._sum?.grandTotal || 0);
    }));

    const revenueChartData = {
      labels: last7Days.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })),
      data: revenueChartDataRaw
    };

    // Real sales by payment method
    const salesByPaymentRaw = await this.prisma.order.groupBy({
      by: ['paymentMethod'],
      _sum: { grandTotal: true },
      _count: { id: true },
      where: { paymentStatus: 'paid' }
    });

    const salesByPaymentMethod = salesByPaymentRaw.map(s => ({
      name: s.paymentMethod?.toUpperCase() || 'Unknown',
      total_amount: Number(s._sum.grandTotal || 0),
      order_count: s._count.id
    }));

    return {
      success: true,
      data: {
        stats,
        recentOrders: recentOrders.map(o => ({
          id: o.id.toString(),
          orderNumber: o.orderNumber,
          customer: o.customer?.name || 'Guest',
          amount: Number(o.grandTotal),
          status: o.status,
          createdAt: o.createdAt
        })),
        recentCustomers: recentCustomers.map(c => ({
          id: c.id.toString(),
          name: c.name,
          email: c.email,
          createdAt: c.createdAt
        })),
        topProducts: validTopProducts,
        orderStatusDistribution,
        revenueChartData,
        salesByPaymentMethod
      }
    };
  }

  async getLowStockReport() {
    const report = await this.prisma.productVariant.findMany({
      where: { qty: { lt: 10 } },
      include: {
        product: {
          select: { name: true, sku: true }
        }
      },
      orderBy: { qty: 'asc' }
    });
    return { success: true, data: report };
  }

  // System Settings
  async getSettings() {
    const settings = await this.prisma.setting.findMany({ orderBy: { sortOrder: 'asc' } });
    return { success: true, data: settings };
  }

  async updateSettings(data: any) {
    const updates = Object.entries(data).map(async ([key, value]) => {
      const existing = await this.prisma.setting.findFirst({ where: { key } });
      if (existing) {
        return this.prisma.setting.update({
          where: { id: existing.id },
          data: { value: String(value) },
        });
      } else {
        return this.prisma.setting.create({
          data: {
            key,
            value: String(value),
            label: key,
            group: 'shop_page',
          }
        });
      }
    });
    await Promise.all(updates);
    return { success: true };
  }

  // Taxes logic
  async getTaxes() {
    const taxes = await this.prisma.taxRate.findMany({
      where: { deletedAt: null },
      include: { taxClasses: true },
      orderBy: { sortOrder: 'asc' },
    });
    
    const mapped = taxes.map(tax => ({
      ...tax,
      isActive: tax.isActive === 1,
    }));

    return { success: true, data: mapped };
  }

  async createTaxRate(data: any) {
    const { taxClassIds, ...rest } = data;
    const taxRate = await this.prisma.taxRate.create({
      data: {
        name: String(rest.name),
        code: rest.code || null,
        description: rest.description || null,
        rate: Number(rest.rate) || 0,
        type: rest.type || 'percentage',
        isActive: rest.isActive ? 1 : 0,
        priority: Number(rest.priority) || 0,
        sortOrder: Number(rest.sortOrder) || 0,
        isCompound: !!rest.isCompound,
        taxClasses: taxClassIds ? {
          connect: taxClassIds.map((id: any) => ({ id: Number(id) }))
        } : undefined
      },
      include: { taxClasses: true }
    });
    return { success: true, data: { ...taxRate, isActive: taxRate.isActive === 1 } };
  }

  async updateTaxRate(id: number, data: any) {
    const { taxClassIds, ...rest } = data;
    const updateData: any = {};
    if (rest.name !== undefined) updateData.name = String(rest.name);
    if (rest.code !== undefined) updateData.code = rest.code;
    if (rest.description !== undefined) updateData.description = rest.description;
    if (rest.rate !== undefined) updateData.rate = Number(rest.rate);
    if (rest.type !== undefined) updateData.type = rest.type;
    if (rest.isActive !== undefined) updateData.isActive = rest.isActive ? 1 : 0;
    if (rest.priority !== undefined) updateData.priority = Number(rest.priority);
    if (rest.sortOrder !== undefined) updateData.sortOrder = Number(rest.sortOrder);
    if (rest.isCompound !== undefined) updateData.isCompound = !!rest.isCompound;
    
    if (taxClassIds !== undefined) {
      updateData.taxClasses = {
        set: taxClassIds.map((tid: any) => ({ id: Number(tid) }))
      };
    }

    const updated = await this.prisma.taxRate.update({
      where: { id: Number(id) },
      data: updateData,
      include: { taxClasses: true }
    });
    return { success: true, data: { ...updated, isActive: updated.isActive === 1 } };
  }

  async deleteTaxRate(id: number) {
    await this.prisma.taxRate.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  // Tax Classes logic
  async getTaxClasses() {
    const classes = await this.prisma.taxClass.findMany({
      where: { deletedAt: null },
      include: { taxRates: true },
    });
    return { success: true, data: classes };
  }

  async createTaxClass(data: any) {
    const { taxRateIds, ...rest } = data;
    const taxClass = await this.prisma.taxClass.create({
      data: {
        name: String(rest.name),
        code: String(rest.code),
        description: rest.description || null,
        isDefault: rest.isDefault ? 1 : 0,
        taxRates: taxRateIds ? {
          connect: taxRateIds.map((id: any) => ({ id: Number(id) }))
        } : undefined
      },
      include: { taxRates: true }
    });
    return { success: true, data: taxClass };
  }

  async updateTaxClass(id: number, data: any) {
    const { taxRateIds, ...rest } = data;
    const updateData: any = {};
    if (rest.name !== undefined) updateData.name = String(rest.name);
    if (rest.code !== undefined) updateData.code = String(rest.code);
    if (rest.description !== undefined) updateData.description = rest.description;
    if (rest.isDefault !== undefined) updateData.isDefault = rest.isDefault ? 1 : 0;
    
    if (taxRateIds !== undefined) {
      updateData.taxRates = {
        set: taxRateIds.map((rid: any) => ({ id: Number(rid) }))
      };
    }

    const updated = await this.prisma.taxClass.update({
      where: { id: Number(id) },
      data: updateData,
      include: { taxRates: true }
    });
    return { success: true, data: updated };
  }

  async deleteTaxClass(id: number) {
    await this.prisma.taxClass.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }


  // Shipping Methods
  async getShippingMethods() {
    const methods = await this.prisma.shippingMethod.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: methods };
  }

  async createShippingMethod(data: any) {
    const method = await this.prisma.shippingMethod.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        config: data.config ? data.config : null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder || 0,
      },
    });
    return { success: true, data: method };
  }

  async updateShippingMethod(id: number | number, data: any) {
    const sId = Number(id);
    const method = await this.prisma.shippingMethod.update({
      where: { id: sId },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        config: data.config !== undefined ? data.config : undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return { success: true, data: method };
  }

  async deleteShippingMethod(id: number | number) {
    const sId = Number(id);
    await this.prisma.shippingMethod.update({
      where: { id: sId },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }
}


