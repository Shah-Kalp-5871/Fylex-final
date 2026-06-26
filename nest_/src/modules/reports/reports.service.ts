import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardReports() {
    // Re-use or move the system dashboard stats logic here if desired,
    // or just return basic aggregations.
    const totalOrders = await this.prisma.order.count();
    const totalRevenue = await this.prisma.order.aggregate({
      where: { paymentStatus: 'paid' },
      _sum: { grandTotal: true },
    });
    const totalProducts = await this.prisma.product.count();

    return {
      success: true,
      data: {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.grandTotal || 0),
        totalProducts,
      },
    };
  }

  async getVariantPerformance() {
    const raw = await this.prisma.productVariant.findMany({
      include: {
        product: { select: { name: true } },
        orderItems: { select: { quantity: true, total: true } }
      }
    });

    const data = raw.map(v => {
      const sold = v.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const revenue = v.orderItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
      
      let status = 'Healthy';
      if (v.qty === 0) status = 'Out of Stock';
      else if (v.qty < 20) status = 'Low Stock';

      // Reconstruct attributes (e.g. from variantAttributes, but for now we simplify)
      const attributes = v.sku; 

      return {
        id: v.id,
        sku: v.sku,
        product: v.product?.name || 'Unknown',
        attributes,
        sold,
        revenue,
        stock: v.qty,
        status
      };
    });

    // Sort by revenue descending
    data.sort((a, b) => b.revenue - a.revenue);

    return { success: true, data };
  }

  async getRevenueReport() {
    // Group orders by month to show revenue trends
    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: 'paid' },
      select: { createdAt: true, grandTotal: true, subtotal: true }
    });

    const months: Record<string, any> = {};
    orders.forEach(o => {
      if (!o.createdAt) return;
      const date = new Date(o.createdAt);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[monthStr]) months[monthStr] = { month: monthStr, revenue: 0, orders: 0 };
      months[monthStr].revenue += Number(o.grandTotal || 0);
      months[monthStr].orders += 1;
    });

    const data = Object.values(months).sort((a, b) => b.month.localeCompare(a.month));
    return { success: true, data };
  }

  async getOrdersReport() {
    // Recent orders with customer info
    const data = await this.prisma.order.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } }
      }
    });

    const formatted = data.map(o => ({
      orderId: o.orderNumber,
      customer: o.customer?.name || 'Guest',
      email: o.customer?.email || '-',
      status: o.status,
      payment: o.paymentStatus,
      total: Number(o.grandTotal || 0),
      date: o.createdAt
    }));
    return { success: true, data: formatted };
  }

  async getInventoryReport() {
    const raw = await this.prisma.productVariant.findMany({
      include: {
        product: { select: { name: true, mainCategory: { select: { name: true } } } }
      }
    });

    const data = raw.map(v => {
      let status = 'Healthy';
      if (v.qty === 0) status = 'Out of Stock';
      else if (v.qty < 20) status = 'Low Stock';

      return {
        id: v.id,
        sku: v.sku,
        product: v.product?.name || 'Unknown',
        category: v.product?.mainCategory?.name || '-',
        stock: v.qty,
        status,
        price: Number(v.price || 0)
      };
    });

    // Sort by stock ascending so low stock items appear first
    data.sort((a, b) => a.stock - b.stock);

    return { success: true, data };
  }

  async getFinancialSummary() {
    // Summary of total payments, refunds, taxes
    const orders = await this.prisma.order.findMany({
      where: { paymentStatus: { in: ['paid', 'refunded'] } }
    });

    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let refunded = 0;

    orders.forEach(o => {
      if (o.paymentStatus === 'refunded') {
        refunded += Number(o.grandTotal || 0);
      } else {
        totalRevenue += Number(o.grandTotal || 0);
        totalTax += Number(o.taxTotal || 0);
        totalDiscount += Number(o.discountTotal || 0);
      }
    });

    const data = [{
      metric: "Gross Revenue",
      value: totalRevenue
    }, {
      metric: "Total Tax Collected",
      value: totalTax
    }, {
      metric: "Total Discounts Given",
      value: totalDiscount
    }, {
      metric: "Refunds Processed",
      value: refunded
    }, {
      metric: "Net Revenue",
      value: totalRevenue - refunded
    }];

    return { success: true, data };
  }

  async getTrafficReport() {
    // Aggregate Visitors (if any)
    const visitors = await this.prisma.visitor.count();
    
    // As a simple demo of the schema's capabilities
    const data = [
      { source: 'Direct Traffic', visitors: Math.floor(visitors * 0.4), bounceRate: '45%' },
      { source: 'Organic Search', visitors: Math.floor(visitors * 0.35), bounceRate: '32%' },
      { source: 'Social Media', visitors: Math.floor(visitors * 0.15), bounceRate: '58%' },
      { source: 'Referral', visitors: Math.floor(visitors * 0.1), bounceRate: '25%' },
    ];

    return { success: true, data };
  }
}
