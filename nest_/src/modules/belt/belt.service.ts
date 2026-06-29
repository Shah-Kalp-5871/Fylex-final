import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BeltService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.belt.findMany({
      orderBy: { createdAt: 'desc' },
      include: { image: true },
    });
  }

  async findOne(id: number) {
    const belt = await this.prisma.belt.findUnique({
      where: { id },
      include: { image: true },
    });
    if (!belt) {
      throw new NotFoundException(`Belt with ID ${id} not found`);
    }
    return belt;
  }

  async create(data: any) {
    return this.prisma.belt.create({
      data: {
        name: data.name,
        price: parseFloat(data.price) || 0,
        stock: parseInt(data.stock, 10) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        imageId: data.imageId || null,
      },
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.belt.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        stock: data.stock !== undefined ? parseInt(data.stock, 10) : undefined,
        isActive: data.isActive,
        imageId: data.imageId !== undefined ? data.imageId : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Ensure it exists
    return this.prisma.belt.delete({
      where: { id },
    });
  }
}
