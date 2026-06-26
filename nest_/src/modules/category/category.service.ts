import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  private toNumber(value: any): number | null {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    try {
      return Number(value);
    } catch (e) {
      return null;
    }
  }

  async createCategory(dto: CreateCategoryDto) {
    const { 
        specificationGroupIds, 
        attributeIds,
        parentId,
        imageId,
        isActive,
        imageUrl,
        image,
        ...rest 
    } = dto as any;
    
    // Explicitly pick only model fields to avoid "Unknown field" errors
    const data: any = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description || null,
      status: dto.status !== undefined ? Number(dto.status) : (isActive === false ? 0 : 1),
      featured: dto.featured !== undefined ? Number(dto.featured) : 0,
      showInNav: dto.showInNav !== undefined ? Number(dto.showInNav) : 1,
      sortOrder: dto.sortOrder !== undefined ? Number(dto.sortOrder) : 0,
      metaTitle: dto.metaTitle || null,
      metaDescription: dto.metaDescription || null,
      metaKeywords: dto.metaKeywords || null,
      imageUrl: imageUrl || image || null,
      parentId: this.toNumber(parentId),
      imageId: this.toNumber(imageId),
    };

    if (specificationGroupIds?.length) {
      data.specGroups = {
        create: specificationGroupIds
            .map(id => this.toNumber(id))
            .filter(id => id !== null)
            .map(groupId => ({
                specificationGroupId: groupId
            }))
      };
    }

    if (attributeIds?.length) {
      data.attributes = {
        create: attributeIds.map(attr => ({
          attributeId: this.toNumber(attr.attributeId),
          isRequired: attr.isRequired ? 1 : 0,
          isFilterable: attr.isFilterable ? 1 : 0,
          sortOrder: Number(attr.sortOrder) || 0
        })).filter(a => a.attributeId !== null)
      };
    }

    try {
      const category = await this.prisma.category.create({
        data,
      });
      return { success: true, data: category };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A category with this slug already exists.');
        }
      }
      throw error;
    }
  }

  async getAllCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        },
        image: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Map to include isActive and potentially other frontend fields
    const mapped = categories.map(cat => ({
      ...cat,
      isActive: cat.status === 1,
    }));

    return { success: true, data: mapped };
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        image: true,
        specGroups: {
          include: {
            specGroup: {
              include: {
                specifications: {
                  include: {
                    specification: {
                      include: {
                        values: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        attributes: {
          include: {
            attribute: {
              include: {
                values: true
              }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException(`Category ${slug} not found.`);
    }

    return {
      ...category,
      isActive: category.status === 1,
    };
  }

  async getCategoryTree() {
    const allCategories = await this.prisma.category.findMany({
      where: { status: 1 },
      include: {
        image: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    const buildTree = (parentId: number | null = null): any[] => {
      return allCategories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          isActive: true,
          children: buildTree(cat.id),
        }));
    };

    return buildTree(null);
  }

  async getCategoryById(id: string | number) {
    const category = await this.prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        image: true,
        specGroups: {
          include: {
            specGroup: {
              include: {
                specifications: {
                  include: {
                    specification: {
                      include: {
                        values: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        attributes: {
          include: {
            attribute: {
              include: {
                values: true
              }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return {
      ...category,
      isActive: category.status === 1,
    };
  }

  async updateCategory(id: string | number, dto: UpdateCategoryDto) {
    const { 
        specificationGroupIds, 
        attributeIds,
        parentId,
        imageId,
        isActive,
        imageUrl,
        image,
        ...rest 
    } = dto as any;
    
    const data: any = {};
    
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.description !== undefined) data.description = dto.description || null;
    if (dto.status !== undefined) data.status = Number(dto.status);
    else if (isActive !== undefined) data.status = isActive ? 1 : 0;
    
    if (dto.featured !== undefined) data.featured = Number(dto.featured);
    if (dto.showInNav !== undefined) data.showInNav = Number(dto.showInNav);
    if (dto.sortOrder !== undefined) data.sortOrder = Number(dto.sortOrder);
    
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle || null;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription || null;
    if (dto.metaKeywords !== undefined) data.metaKeywords = dto.metaKeywords || null;
    
    if (imageUrl !== undefined || image !== undefined) {
      data.imageUrl = imageUrl || image || null;
    }

    if (parentId !== undefined) {
      data.parentId = this.toNumber(parentId);
    }
    if (imageId !== undefined) {
      data.imageId = this.toNumber(imageId);
    }

    // Refresh Spec Groups
    if (specificationGroupIds !== undefined) {
        data.specGroups = {
            deleteMany: {},
            create: (specificationGroupIds || [])
                .map(id => this.toNumber(id))
                .filter(id => id !== null)
                .map(groupId => ({
                    specificationGroupId: groupId
                }))
        };
    }

    // Refresh Attributes
    if (attributeIds !== undefined) {
        data.attributes = {
            deleteMany: {},
            create: (attributeIds || []).map(attr => ({
                attributeId: this.toNumber(attr.attributeId),
                isRequired: attr.isRequired ? 1 : 0,
                isFilterable: attr.isFilterable ? 1 : 0,
                sortOrder: Number(attr.sortOrder) || 0
            })).filter(a => a.attributeId !== null)
        };
    }

    try {
      const category = await this.prisma.category.update({
        where: { id: Number(id) },
        data,
      });
      return { success: true, data: category };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Category with ID ${id} not found.`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('A category with this slug already exists.');
        }
      }
      throw error;
    }
  }

  async deleteCategory(id: string | number) {
    try {
      return await this.prisma.category.delete({
        where: { id: Number(id) },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Category with ID ${id} not found.`);
        }
      }
      throw error;
    }
  }
}


