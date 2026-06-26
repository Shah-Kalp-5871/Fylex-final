import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoicePdf(orderId: string): Promise<PDFKit.PDFDocument> {
    const oId = Number(orderId);
    const order = await this.prisma.order.findUnique({
      where: { id: oId },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          }
        },
        addresses: true,
        customer: true,
        payments: true,
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    this.generateHeader(doc);
    this.generateCustomerInformation(doc, order);
    this.generateInvoiceTable(doc, order);
    this.generateFooter(doc);

    doc.end();
    return doc;
  }

  private generateHeader(doc: PDFKit.PDFDocument) {
    try {
      const logoPath = path.join(process.cwd(), '..', 'next_', 'public', 'assets', 'fylex-logo-dark.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 120 });
      } else {
        doc.fontSize(24).font('Helvetica-Bold').text('FYLEX', 50, 50);
      }
    } catch (e) {
      doc.fontSize(24).font('Helvetica-Bold').text('FYLEX', 50, 50);
    }

    doc
      .fillColor('#444444')
      .fontSize(10)
      .text('Fylex Premium Timepieces', 200, 50, { align: 'right' })
      .text('123 Luxury Avenue', 200, 65, { align: 'right' })
      .text('Mumbai, MH 400001', 200, 80, { align: 'right' })
      .text('GSTIN: 27AAAAA0000A1Z5', 200, 95, { align: 'right' })
      .text('support@fylex.com | +91 9876543210', 200, 110, { align: 'right' })
      .moveDown();
  }

  private generateCustomerInformation(doc: PDFKit.PDFDocument, order: any) {
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('TAX INVOICE', 50, 160);

    const hrY = 185;
    this.generateHr(doc, hrY);

    const customerInfoTop = 200;
    
    // Invoice Number logic
    const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order.id.toString().padStart(5, '0')}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN');
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
    
    // Payment info
    const paymentMethod = order.paymentMethod || 'N/A';
    const paymentStatus = order.paymentStatus || 'Pending';
    const transactionId = order.payments && order.payments.length > 0 ? order.payments[0].providerId : 'N/A';

    doc
      .fontSize(10)
      .text('Invoice Number:', 50, customerInfoTop)
      .font('Helvetica-Bold')
      .text(invoiceNumber, 150, customerInfoTop)
      .font('Helvetica')
      .text('Invoice Date:', 50, customerInfoTop + 15)
      .text(invoiceDate, 150, customerInfoTop + 15)
      .text('Order Number:', 50, customerInfoTop + 30)
      .text(order.orderNumber || `#${order.id}`, 150, customerInfoTop + 30)
      .text('Order Date:', 50, customerInfoTop + 45)
      .text(orderDate, 150, customerInfoTop + 45)
      .text('Payment Method:', 50, customerInfoTop + 60)
      .text(paymentMethod, 150, customerInfoTop + 60)
      .text('Payment Status:', 50, customerInfoTop + 75)
      .text(paymentStatus.toUpperCase(), 150, customerInfoTop + 75)
      .text('Transaction ID:', 50, customerInfoTop + 90)
      .text(transactionId, 150, customerInfoTop + 90);

    // Billed To / Shipped To
    const billingAddress = order.addresses?.find(a => a.type === 'billing') || order.addresses?.[0];
    const shippingAddress = order.addresses?.find(a => a.type === 'shipping') || order.addresses?.[0];

    let billingText = order.customerFirstName 
      ? `${order.customerFirstName} ${order.customerLastName || ''}` 
      : (order.customer?.name || 'Customer');

    if (billingAddress) {
      billingText += `\n${billingAddress.line1 || billingAddress.address}`;
      if (billingAddress.line2) billingText += `\n${billingAddress.line2}`;
      billingText += `\n${billingAddress.city}, ${billingAddress.state} ${billingAddress.pincode || billingAddress.zip}`;
      if (billingAddress.country) billingText += `\n${billingAddress.country}`;
      if (billingAddress.phone || order.customerMobile) billingText += `\nPhone: ${billingAddress.phone || order.customerMobile}`;
    }

    doc
      .font('Helvetica-Bold')
      .text('Billed To:', 350, customerInfoTop)
      .font('Helvetica')
      .text(billingText, 350, customerInfoTop + 15);

    this.generateHr(doc, 320);
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, order: any) {
    let i;
    const invoiceTableTop = 350;

    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      invoiceTableTop,
      'Item',
      'SKU',
      'Unit Cost',
      'Quantity',
      'Line Total'
    );
    this.generateHr(doc, invoiceTableTop + 20);
    doc.font('Helvetica');

    let position = invoiceTableTop + 30;

    for (i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const itemName = item.product?.title || 'Product';
      const itemSku = item.productVariant?.sku || 'N/A';
      const unitCost = Number(item.price);
      const lineTotal = unitCost * item.quantity;

      this.generateTableRow(
        doc,
        position,
        itemName,
        itemSku,
        this.formatCurrency(unitCost),
        item.quantity.toString(),
        this.formatCurrency(lineTotal)
      );

      this.generateHr(doc, position + 20);
      position += 30;
    }

    const subtotal = Number(order.subtotal || 0);
    const tax = Number(order.taxTotal || 0);
    const shipping = Number(order.shippingTotal || 0);
    const discount = Number(order.discountTotal || 0);
    const total = Number(order.grandTotal || 0);

    const subtotalPosition = position + 10;
    doc.font('Helvetica-Bold');
    
    this.generateTableRow(doc, subtotalPosition, '', '', '', 'Subtotal', this.formatCurrency(subtotal));
    
    let currentPos = subtotalPosition + 20;
    
    if (tax > 0) {
      doc.font('Helvetica');
      this.generateTableRow(doc, currentPos, '', '', '', 'Tax', this.formatCurrency(tax));
      currentPos += 20;
    }
    
    if (shipping > 0) {
      doc.font('Helvetica');
      this.generateTableRow(doc, currentPos, '', '', '', 'Shipping', this.formatCurrency(shipping));
      currentPos += 20;
    }

    if (discount > 0) {
      doc.font('Helvetica');
      this.generateTableRow(doc, currentPos, '', '', '', 'Discount', `-${this.formatCurrency(discount)}`);
      currentPos += 20;
    }

    this.generateHr(doc, currentPos);
    
    doc.font('Helvetica-Bold');
    this.generateTableRow(doc, currentPos + 10, '', '', '', 'Grand Total', this.formatCurrency(total));
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(10)
      .fillColor('#888888')
      .text(
        'Thank you for your business. For any queries regarding this invoice, please contact support@fylex.com.',
        50,
        730,
        { align: 'center', width: 500 }
      );
  }

  private generateTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: string,
    sku: string,
    unitCost: string,
    quantity: string,
    lineTotal: string
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y, { width: 200 })
      .text(sku, 260, y, { width: 90 })
      .text(unitCost, 350, y, { width: 70, align: 'right' })
      .text(quantity, 420, y, { width: 40, align: 'right' })
      .text(lineTotal, 0, y, { align: 'right' });
  }

  private generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private formatCurrency(amount: number) {
    return 'INR ' + Math.round(amount).toLocaleString('en-IN');
  }
}
