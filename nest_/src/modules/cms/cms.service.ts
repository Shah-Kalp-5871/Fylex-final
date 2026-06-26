import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  private parseJson(value: any, defaultValue: any = null): any {
    if (!value || typeof value !== 'string') return value || defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      return defaultValue;
    }
  }

  // Fetch active banners filtered by position
  async getBanners(position?: string) {
    const where: any = { isActive: true };
    if (position) where.position = position;

    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Fetch active popups
  async getActivePopups() {
    const now = new Date();
    const popups = await this.prisma.popup.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } }
        ],
        AND: [
          { OR: [ { endsAt: null }, { endsAt: { gte: now } } ] }
        ]
      },
    });
    return popups.map(p => ({
      ...p,
      data: this.parseJson((p as any).data, {}),
      displayRules: this.parseJson((p as any).displayRules, {})
    }));
  }

  // Admin Methods
  async getAllPages() {
    const pages = await this.prisma.page.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, data: pages };
  }

  async createPage(data: any) {
    const page = await this.prisma.page.create({ data });
    return { success: true, data: page };
  }

  async updatePage(id: number, data: any) {
    const page = await this.prisma.page.update({ where: { id }, data });
    return { success: true, data: page };
  }

  async deletePage(id: number) {
    await this.prisma.page.delete({ where: { id } });
    return { success: true };
  }

  // Fetch static page by slug
  async getPageBySlug(slug: string) {
    return this.prisma.page.findUnique({
      where: { slug },
    });
  }

  // Banners
  async getAllBanners() {
    const banners = await this.prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return { success: true, data: banners };
  }

  async createBanner(data: any) {
    const banner = await this.prisma.banner.create({
        data: {
            name: data.name || data.title || 'Untitled Banner',
            title: data.title,
            subtitle: data.subtitle,
            content: data.content,
            image: data.image,
            link: data.link,
            textColor: data.textColor,
            position: data.position || 'main',
            sortOrder: Number(data.sortOrder) || 0,
            isActive: data.isActive !== undefined ? data.isActive : (data.status ? (data.status === 'active' || data.status === 'true') : true),
        }
    });
    return { success: true, data: banner };
  }

  async updateBanner(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.textColor !== undefined) updateData.textColor = data.textColor;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    } else if (data.status !== undefined) {
      updateData.isActive = data.status === 'active' || data.status === 'true' || data.status === true;
    }

    const banner = await this.prisma.banner.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return { success: true, data: banner };
  }

  async deleteBanner(id: number) {
    await this.prisma.banner.delete({ where: { id } });
    return { success: true };
  }

  // Testimonials
  async getTestimonials() {
    const testimonials = await this.prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: testimonials };
  }

  async createTestimonial(data: any) {
    const testimonial = await this.prisma.testimonial.create({
      data: {
        name: data.name,
        designation: data.designation,
        message: data.message || data.content,
        rating: Number(data.rating) || 5,
        isActive: data.isActive ?? true,
        image: data.image,
      },
    });
    return { success: true, data: testimonial };
  }

  async updateTestimonial(id: number, data: any) {
    const testimonial = await this.prisma.testimonial.update({
      where: { id },
      data: {
        name: data.name,
        designation: data.designation,
        message: data.message || data.content,
        rating: data.rating ? Number(data.rating) : undefined,
        isActive: data.isActive,
        image: data.image,
      },
    });
    return { success: true, data: testimonial };
  }

  async deleteTestimonial(id: number | number) {
    const tId = Number(id);
    await this.prisma.testimonial.delete({
      where: { id: tId },
    });
    return { success: true };
  }

  // Home Page Sections
  async getHomeSections() {
    const list = await this.prisma.homeSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    // Frontend expects 'name' for 'title', 'status' for 'isActive', and 'order' for 'sortOrder'
    const mapped = list.map(s => ({
        ...s,
        content: this.parseJson(s.content),
        name: s.title,
        status: s.isActive,
        order: s.sortOrder
    }));
    return { success: true, data: mapped };
  }

  async createHomeSection(data: any) {
    const section = await this.prisma.homeSection.create({
      data: {
        title: data.name,
        type: data.type || 'products',
        sortOrder: Number(data.order) || 0,
        isActive: data.status ?? true,
      },
    });
    return { success: true, data: { ...section, name: section.title, status: section.isActive, order: section.sortOrder } };
  }

  async updateHomeSection(id: number | number, data: any) {
    const sId = Number(id);
    const updateData: any = {};
    if (data.name !== undefined) updateData.title = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.order !== undefined) updateData.sortOrder = Number(data.order);
    if (data.status !== undefined) updateData.isActive = data.status === true || data.status === 'true';

    const section = await this.prisma.homeSection.update({
      where: { id: sId },
      data: updateData,
    });
    return { success: true, data: { ...section, name: section.title, status: section.isActive, order: section.sortOrder } };
  }

  async deleteHomeSection(id: number | number) {
    const sId = Number(id);
    await this.prisma.homeSection.delete({
      where: { id: sId },
    });
    return { success: true };
  }

  // Community Images (Atelier Chronicles)
  async getCommunityImages() {
    const images = await this.prisma.communityImage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: images };
  }

  async getAllCommunityImages() {
    const images = await this.prisma.communityImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: images };
  }

  async createCommunityImage(data: any) {
    const image = await this.prisma.communityImage.create({
      data: {
        title: data.title || null,
        image: data.image,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return { success: true, data: image };
  }

  async updateCommunityImage(id: number, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) updateData.isActive = data.isActive === true || data.isActive === 'true';

    const image = await this.prisma.communityImage.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return { success: true, data: image };
  }

  async deleteCommunityImage(id: number) {
    await this.prisma.communityImage.delete({ where: { id: Number(id) } });
    return { success: true };
  }
}


