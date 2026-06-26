import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const faq = await this.prisma.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return { success: true, data: faq };
  }

  async findAll(activeOnly: boolean = false) {
    const faqs = await this.prisma.faq.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: faqs };
  }

  async findOne(id: number) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('Faq not found');
    return { success: true, data: faq };
  }

  async update(id: number, data: any) {
    const faq = await this.prisma.faq.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
        isActive: data.isActive,
      },
    });
    return { success: true, data: faq };
  }

  async remove(id: number) {
    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }
}
