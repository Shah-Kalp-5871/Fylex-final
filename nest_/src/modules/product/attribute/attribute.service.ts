import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAttributeDto, CreateAttributeValueDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const attributes = await this.prisma.attribute.findMany({
      include: {
        values: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const mapped = attributes.map(attr => ({
      ...attr,
      isActive: attr.status === 'active' || attr.status === '1',
    }));

    return {
      success: true,
      data: mapped,
    };
  }

  async findOne(id: number | string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: Number(id) },
      include: {
        values: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found.`);
    }

    return {
      success: true,
      data: {
        ...attribute,
        isActive: attribute.status === 'active' || attribute.status === '1',
      },
    };
  }

  async create(createAttributeDto: CreateAttributeDto) {
    const { values, isActive, ...rest } = createAttributeDto;
    
    // Ensure code is a string
    const code = rest.code || (rest.name ? rest.name.toLowerCase().replace(/ /g, '_') : `attr_${Date.now()}`);

    const attribute = await this.prisma.attribute.create({
      data: {
        ...rest,
        code,
        status: createAttributeDto.status || (isActive === false ? 'inactive' : 'active'),
        values: {
          create: values?.map(val => ({
            ...val,
            imageId: val.imageId ? Number(val.imageId) : null,
          })),
        },
      },
      include: {
        values: true,
      },
    });

    return {
      success: true,
      data: {
        ...attribute,
        isActive: attribute.status === 'active',
      },
    };
  }

  async update(id: number | string, updateAttributeDto: UpdateAttributeDto) {
    const { values, isActive, ...rest } = updateAttributeDto as any;

    const attribute = await this.prisma.attribute.update({
      where: { id: Number(id) },
      data: {
        ...rest,
        ...(isActive !== undefined ? { status: isActive ? 'active' : 'inactive' } : {}),
      },
    });

    return {
      success: true,
      data: {
        ...attribute,
        isActive: attribute.status === 'active',
      },
    };
  }

  async remove(id: number | string) {
    await this.prisma.attribute.delete({
      where: { id: Number(id) },
    });

    return {
      success: true,
      message: 'Attribute deleted successfully',
    };
  }

  // --- Attribute Value Methods ---

  async createValue(attributeId: number | string, dto: CreateAttributeValueDto) {
    const value = await this.prisma.attributeValue.create({
      data: {
        ...dto,
        attributeId: Number(attributeId),
        imageId: dto.imageId ? Number(dto.imageId) : null,
      },
    });

    return {
      success: true,
      data: value,
    };
  }

  async updateValue(valueId: number | string, dto: UpdateAttributeValueDto) {
    const { imageId, ...rest } = dto as any;
    const data: any = { ...rest };
    if (imageId !== undefined) {
      data.imageId = imageId ? Number(imageId) : null;
    }

    const value = await this.prisma.attributeValue.update({
      where: { id: Number(valueId) },
      data,
    });

    return {
      success: true,
      data: value,
    };
  }

  async removeValue(valueId: number | string) {
    await this.prisma.attributeValue.delete({
      where: { id: Number(valueId) },
    });

    return {
      success: true,
      message: 'Attribute value deleted successfully',
    };
  }
}


