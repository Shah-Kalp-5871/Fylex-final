import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SpecificationService {
  constructor(private prisma: PrismaService) {}

  // --- Specification Methods ---
  async findAll() {
    const specs = await this.prisma.specification.findMany({
      include: {
        _count: {
          select: { values: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: specs };
  }

  async findOne(id: number | string) {
    const spec = await this.prisma.specification.findUnique({
      where: { id: Number(id) },
    });
    if (!spec) throw new NotFoundException('Specification not found');
    return { success: true, data: spec };
  }

  async create(data: any) {
    const spec = await this.prisma.specification.create({
      data: {
        name: data.name,
        code: data.code || data.name.toLowerCase().replace(/ /g, '_'),
        type: data.type || 'text',
        sortOrder: data.sortOrder || 0,
        isRequired: data.isRequired === true || data.isRequired === 1,
        isFilterable: data.isFilterable === true || data.isFilterable === 1,
        isActive: data.isActive === true || data.isActive === 1,
      },
    });
    return { success: true, data: spec };
  }

  async update(id: number | string, data: any) {
    const spec = await this.prisma.specification.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        sortOrder: data.sortOrder,
        isRequired: data.isRequired === true || data.isRequired === 1,
        isFilterable: data.isFilterable === true || data.isFilterable === 1,
        isActive: data.isActive === true || data.isActive === 1,
      },
    });
    return { success: true, data: spec };
  }

  async remove(id: number | string) {
    await this.prisma.specification.delete({
      where: { id: Number(id) },
    });
    return { success: true, message: 'Specification deleted' };
  }

  // --- Specification Group Methods ---
  async findAllGroups() {
    const groups = await this.prisma.specificationGroup.findMany({
      include: {
        specifications: {
          include: { specification: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    
    // Map to include a simple specs_count and items for the view modal
    return { 
      success: true, 
      data: groups.map(g => ({
        ...g,
        specs_count: g.specifications.length,
        items: g.specifications.map(s => ({
          ...s.specification,
          linkSortOrder: s.sortOrder
        }))
      })) 
    };
  }

  async findOneGroup(id: number | string) {
    const group = await this.prisma.specificationGroup.findUnique({
      where: { id: Number(id) },
      include: {
        specifications: {
          include: { specification: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!group) throw new NotFoundException('Specification group not found');
    return { success: true, data: group };
  }

  async createGroup(data: any) {
    const group = await this.prisma.specificationGroup.create({
      data: {
        name: data.name,
        sortOrder: data.sortOrder || 0,
      },
    });

    if (data.specificationIds && Array.isArray(data.specificationIds)) {
      const mappings = data.specificationIds.map((specId, index) => ({
        specificationGroupId: group.id,
        specificationId: Number(specId),
        sortOrder: index,
      }));
      await this.prisma.specGroupSpec.createMany({
        data: mappings,
      });
    }

    return { success: true, data: group };
  }

  async updateGroup(id: number | string, data: any) {
    const groupId = Number(id);
    const group = await this.prisma.specificationGroup.update({
      where: { id: groupId },
      data: {
        name: data.name,
        sortOrder: data.sortOrder,
      },
    });

    if (data.specificationIds && Array.isArray(data.specificationIds)) {
      // Simple sync: delete all and recreate
      await this.prisma.specGroupSpec.deleteMany({
        where: { specificationGroupId: groupId },
      });

      const mappings = data.specificationIds.map((specId, index) => ({
        specificationGroupId: groupId,
        specificationId: Number(specId),
        sortOrder: index,
      }));
      await this.prisma.specGroupSpec.createMany({
        data: mappings,
      });
    }

    return { success: true, data: group };
  }

  async removeGroup(id: number | string) {
    await this.prisma.specificationGroup.delete({
      where: { id: Number(id) },
    });
    return { success: true, message: 'Specification group deleted' };
  }

  // --- Group Specification Mapping ---
  async addSpecToGroup(groupId: number | string, specId: number | string, sortOrder: number = 0) {
    const mapping = await this.prisma.specGroupSpec.create({
      data: {
        specificationGroupId: Number(groupId),
        specificationId: Number(specId),
        sortOrder,
      },
    });
    return { success: true, data: mapping };
  }

  async removeSpecFromGroup(groupId: number | string, specId: number | string) {
    await this.prisma.specGroupSpec.delete({
      where: {
        specificationGroupId_specificationId: {
          specificationGroupId: Number(groupId),
          specificationId: Number(specId),
        },
      },
    });
    return { success: true, message: 'Specification removed from group' };
  }

  // --- Specification Value Methods ---
  async findAllValues(specId: number | string) {
    const values = await this.prisma.specificationValue.findMany({
      where: { specificationId: Number(specId) },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, data: values };
  }

  async createValue(specId: number | string, data: any) {
    const value = await this.prisma.specificationValue.create({
      data: {
        specificationId: Number(specId),
        value: data.value,
        sortOrder: data.sortOrder || 0,
        status: data.status !== undefined ? data.status : 1,
      },
    });
    return { success: true, data: value };
  }

  async updateValue(id: number | string, data: any) {
    const value = await this.prisma.specificationValue.update({
      where: { id: Number(id) },
      data: {
        value: data.value,
        sortOrder: data.sortOrder,
        status: data.status,
      },
    });
    return { success: true, data: value };
  }

  async removeValue(id: number | string) {
    await this.prisma.specificationValue.delete({
      where: { id: Number(id) },
    });
    return { success: true, message: 'Value deleted' };
  }
}


