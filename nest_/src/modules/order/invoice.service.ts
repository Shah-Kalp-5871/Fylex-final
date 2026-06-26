import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoicePdf(orderId: string, res: any): Promise<void> {
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
    doc.pipe(res);

    this.generateHeader(doc);
    this.generateCustomerInformation(doc, order);
    this.generateInvoiceTable(doc, order);
    this.generateFooter(doc);

    doc.end();
  }

  private generateHeader(doc: PDFKit.PDFDocument) {
    // Premium Black Header Bar
    doc.rect(0, 0, 600, 100).fill('#000000');
    
    try {
      const logoPath = path.join(process.cwd(), '..', 'next_', 'public', 'assets', 'fylex-logo-light.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 35, { width: 120 });
      } else {
        doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('FYLEX', 50, 40);
      }
    } catch (e) {
      doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('FYLEX', 50, 40);
    }

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica')
      .text('Fylex Premium Timepieces', 200, 35, { align: 'right' })
      .text('123 Luxury Avenue, Mumbai, MH 400001', 200, 50, { align: 'right' })
      .text('GSTIN: 27AAAAA0000A1Z5', 200, 65, { align: 'right' })
      .text('support@fylex.com  |  +91 9876543210', 200, 80, { align: 'right' });
      
    doc.moveDown();
  }

  private generateCustomerInformation(doc: PDFKit.PDFDocument, order: any) {
    doc
      .fillColor('#000000')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 50, 130);

    this.generateHr(doc, 155, '#000000', 2);

    const customerInfoTop = 175;
    
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
      .fillColor('#555555')
      .font('Helvetica-Bold')
      .text('INVOICE NUMBER', 50, customerInfoTop)
      .font('Helvetica')
      .fillColor('#000000')
      .text(invoiceNumber, 50, customerInfoTop + 15)
      
      .fillColor('#555555')
      .font('Helvetica-Bold')
      .text('DATE OF ISSUE', 180, customerInfoTop)
      .font('Helvetica')
      .fillColor('#000000')
      .text(invoiceDate, 180, customerInfoTop + 15)

      .fillColor('#555555')
      .font('Helvetica-Bold')
      .text('ORDER NUMBER', 310, customerInfoTop)
      .font('Helvetica')
      .fillColor('#000000')
      .text(order.orderNumber || `#${order.id}`, 310, customerInfoTop + 15)
      
      .fillColor('#555555')
      .font('Helvetica-Bold')
      .text('PAYMENT STATUS', 440, customerInfoTop)
      .font('Helvetica')
      .fillColor('#000000')
      .text(paymentStatus.toUpperCase(), 440, customerInfoTop + 15);

    this.generateHr(doc, customerInfoTop + 45, '#e5e7eb', 1);

    // Billed To / Shipped To
    const billingAddress = order.addresses?.find(a => a.type === 'billing') || order.addresses?.[0];

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
      .fillColor('#555555')
      .font('Helvetica-Bold')
      .text('BILLED TO', 50, customerInfoTop + 65)
      .font('Helvetica')
      .fillColor('#000000')
      .text(billingText, 50, customerInfoTop + 80, { lineGap: 3 });

    this.generateHr(doc, customerInfoTop + 160, '#000000', 2);
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, order: any) {
    let i;
    const invoiceTableTop = 360;

    doc.font('Helvetica-Bold').fillColor('#000000');
    this.generateTableRow(
      doc,
      invoiceTableTop,
      'ITEM DESCRIPTION',
      'SKU',
      'UNIT PRICE',
      'QTY',
      'TOTAL'
    );
    this.generateHr(doc, invoiceTableTop + 20, '#000000', 1);
    doc.font('Helvetica');

    let position = invoiceTableTop + 35;

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

      this.generateHr(doc, position + 25, '#e5e7eb', 1);
      position += 35;
    }

    const subtotal = Number(order.subtotal || 0);
    const tax = Number(order.taxTotal || 0);
    const shipping = Number(order.shippingTotal || 0);
    const discount = Number(order.discountTotal || 0);
    const total = Number(order.grandTotal || 0);

    const subtotalPosition = position + 15;
    
    let currentPos = subtotalPosition;
    
    doc.font('Helvetica').fillColor('#555555');
    this.generateSummaryRow(doc, currentPos, 'Subtotal:', this.formatCurrency(subtotal));
    currentPos += 20;
    
    if (tax > 0) {
      this.generateSummaryRow(doc, currentPos, 'Tax (Included):', this.formatCurrency(tax));
      currentPos += 20;
    }
    
    if (shipping > 0) {
      this.generateSummaryRow(doc, currentPos, 'Shipping:', this.formatCurrency(shipping));
      currentPos += 20;
    }

    if (discount > 0) {
      this.generateSummaryRow(doc, currentPos, 'Discount:', `-${this.formatCurrency(discount)}`);
      currentPos += 20;
    }

    this.generateHr(doc, currentPos + 5, '#000000', 2);
    
    doc.font('Helvetica-Bold').fillColor('#000000').fontSize(12);
    this.generateSummaryRow(doc, currentPos + 15, 'GRAND TOTAL', this.formatCurrency(total));
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(9)
      .fillColor('#888888')
      .font('Helvetica')
      .text(
        'Thank you for your business.',
        50,
        720,
        { align: 'center', width: 500 }
      )
      .text(
        'For any queries regarding this invoice, please contact support@fylex.com.',
        50,
        735,
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
      .fontSize(9)
      .text(item, 50, y, { width: 190 })
      .text(sku, 250, y, { width: 80 })
      .text(unitCost, 340, y, { width: 70, align: 'right' })
      .text(quantity, 420, y, { width: 40, align: 'right' })
      .text(lineTotal, 470, y, { width: 80, align: 'right' });
  }

  private generateSummaryRow(
    doc: PDFKit.PDFDocument,
    y: number,
    label: string,
    value: string
  ) {
    doc
      .text(label, 350, y, { width: 110, align: 'right' })
      .text(value, 470, y, { width: 80, align: 'right' });
  }

  private generateHr(doc: PDFKit.PDFDocument, y: number, color: string = '#e5e7eb', width: number = 1) {
    doc
      .strokeColor(color)
      .lineWidth(width)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private formatCurrency(amount: number) {
    return 'Rs. ' + Math.round(amount).toLocaleString('en-IN');
  }
}
