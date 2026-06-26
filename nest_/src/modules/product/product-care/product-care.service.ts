import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductCareService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const step = await this.prisma.productCareStep.create({
      data: {
        productId: Number(data.productId),
        stepNumber: Number(data.stepNumber),
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
    return { success: true, data: step };
  }

  async findByProduct(productId: number) {
    const steps = await this.prisma.productCareStep.findMany({
      where: { productId },
      orderBy: { stepNumber: 'asc' },
    });
    return { success: true, data: steps };
  }

  async findAllProductsWithSteps() {
    // Get all distinct products that have care steps
    const steps = await this.prisma.productCareStep.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            heroImage: true
          }
        }
      },
      orderBy: [
        { productId: 'asc' },
        { stepNumber: 'asc' }
      ]
    });
    return { success: true, data: steps };
  }

  async findOne(id: number) {
    const step = await this.prisma.productCareStep.findUnique({ where: { id } });
    if (!step) throw new NotFoundException('Care step not found');
    return { success: true, data: step };
  }

  async update(id: number, data: any) {
    const step = await this.prisma.productCareStep.update({
      where: { id },
      data: {
        productId: data.productId ? Number(data.productId) : undefined,
        stepNumber: data.stepNumber ? Number(data.stepNumber) : undefined,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
    return { success: true, data: step };
  }

  async remove(id: number) {
    await this.prisma.productCareStep.delete({ where: { id } });
    return { success: true };
  }
}
