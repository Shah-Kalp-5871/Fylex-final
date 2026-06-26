import { Injectable, ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MediaService } from '../media/media.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  private safeNumber(value: any, name: string, required = false): number | null {
    if (value === null || value === undefined || value === 'null' || value === '') {
      if (required) throw new BadRequestException(`${name} is required.`);
      return null;
    }
    try {
      return Number(value);
    } catch (e) {
      throw new BadRequestException(`Invalid ${name}: "${value}" is not a valid number.`);
    }
  }

  private parseJson(value: any, defaultValue: any = []): any {
    if (!value || typeof value !== 'string') return value || defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      return defaultValue;
    }
  }

  private handlePrismaError(error: any, context: string): never {
    console.error(`[${context}] Error:`, error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          const target = (error.meta?.target as string[])?.join(', ') || 'field';
          throw new ConflictException(`Unique constraint failed on ${target}. This ${target} is already in use.`);
        case 'P2025':
          throw new NotFoundException(`${context} target record not found.`);
        case 'P2003':
          throw new BadRequestException(`Foreign key constraint failed. One of the referenced IDs (category, etc.) does not exist.`);
        default:
          throw new BadRequestException(`Database Error (${error.code}): ${error.message}`);
      }
    }
    
    if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ConflictException) {
      throw error;
    }

    throw new InternalServerErrorException(`${context} failed: ${error.message || 'Unknown internal error'}`);
  }

  async createProduct(dto: CreateProductDto, imageFiles?: Array<Express.Multer.File>) {
    const { mainCategoryId, taxClassId, ...rest } = dto;
    
    try {
      // Convert IDs to number and decimals to string for Prisma
      const data: any = {
        ...rest,
        price: rest.price ? Number(rest.price) : 0,
        sellingPrice: rest.price ? Number(rest.price) : 0,

        mainCategoryId: this.safeNumber(mainCategoryId, 'mainCategoryId'),
        taxClassId: this.safeNumber(taxClassId, 'taxClassId'),
      };

    if (imageFiles && imageFiles.length > 0) {
      const savedMedia = await Promise.all(
        imageFiles.map(file => this.mediaService.saveUploadedFile(file))
      );
      // Construct public URLs for the images
      data.images = JSON.stringify(savedMedia.map(m => `/uploads/${m.data.fileName}`));
    }

    if (rest.specialPrice) {
      data.specialPrice = Number(rest.specialPrice);
    }

    let baseSlug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let finalSlug = baseSlug;
    let slugExists = await this.prisma.product.findUnique({ where: { slug: finalSlug } });
    let counter = 1;
    while (slugExists) {
      finalSlug = `${baseSlug}-${counter}`;
      slugExists = await this.prisma.product.findUnique({ where: { slug: finalSlug } });
      counter++;
    }

    // Filter data to only include valid Prisma fields for Product
    const prismaData: any = {
      name: data.name,
      slug: finalSlug,
      sku: data.sku || data.productCode || `SKU-${Date.now()}`,
      productCode: data.productCode,
      productType: data.productType || 'simple',
      description: data.description,
      shortDescription: data.shortDescription || data.shortDesc,
      price: data.price,
      specialPrice: data.specialPrice,
      specialPriceStart: data.specialPriceStart,
      specialPriceEnd: data.specialPriceEnd,
      sellingPrice: data.sellingPrice,
      manageStock: data.manageStock ?? true,
      qty: data.qty ?? 0,
      inStock: data.inStock ?? true,
      codAvailable: data.codAvailable ?? true,
      status: data.status || 'active',
      heroImage: data.heroImage,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
      isBestseller: data.isBestseller ?? false,
      weight: data.weight,
      length: data.length,
      width: data.width,
      height: data.height,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      images: typeof data.images === 'string' ? data.images : JSON.stringify(data.images || (dto as any).gallery?.map((g: any) => g.url) || []),

      mainCategoryId: data.mainCategoryId || (dto as any).categoryId,
      taxClassId: data.taxClassId,
      theme: data.theme,
      subtitle: data.subtitle,
      tagline: data.tagline,
      heritageText: data.heritageText,
      bgColor: data.bgColor,
      accentColor: data.accentColor,
      textColor: data.textColor,
      gradient: data.gradient,
      mistColor: data.mistColor,
      videoUrl: data.videoUrl,
      discoverHeroBgImage: data.discoverHeroBgImage,
    };

      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: prismaData,
        });

        const productId = product.id;

        // 1. Handle Tags
        if (dto.tagIds && dto.tagIds.length > 0) {
          const tagData = dto.tagIds
            .map((tId: any) => ({
              productId,
              tagId: this.safeNumber(tId, 'tagId'),
            }))
            .filter((t: any) => t.tagId !== null);
          
          if (tagData.length > 0) {
            await tx.productTag.createMany({ data: tagData as any });
          }
        }

        // 1.5 Handle Product Default Media
        const productMediaMap = new Map<number, any>();
        if (data.heroImageId) {
          const mid = this.safeNumber(data.heroImageId, 'heroImageId');
          if (mid) {
            productMediaMap.set(mid, { productId, mediaId: mid, type: 'MAIN', sortOrder: 0 });
          }
        }
        if (data.galleryIds && Array.isArray(data.galleryIds)) {
          data.galleryIds.forEach((mid: any, idx: number) => {
            const id = this.safeNumber(mid, 'mediaId');
            if (id && !productMediaMap.has(id)) {
              productMediaMap.set(id, { productId, mediaId: id, type: 'GALLERY', sortOrder: productMediaMap.size });
            }
          });
        }
        if (productMediaMap.size > 0) {
          await tx.productMedia.createMany({ data: Array.from(productMediaMap.values()) });
        }

        // 2. Handle Specifications
        if (dto.specifications && dto.specifications.length > 0) {
          const specData = dto.specifications
            .map((spec: any) => ({
              productId,
              specificationId: this.safeNumber(spec.specificationId, 'specificationId'),
              value: spec.value || '',
              specificationValueId: this.safeNumber(spec.specificationValueId, 'specificationValueId'),
            }))
            .filter((s: any) => s.specificationId !== null);

          if (specData.length > 0) {
            await tx.productSpecification.createMany({ data: specData as any });
          }
        }

        // 3. Handle Variants
        if (dto.variants && dto.variants.length > 0) {
          for (const variant of dto.variants) {
            const v = await tx.productVariant.create({
              data: {
                productId,
                sku: variant.sku || `VAR-${Date.now()}-${Math.random()}`,
                price: Number(variant.price || 0),
                comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
                sellingPrice: Number(variant.price || 0),
                qty: Number(variant.stock || variant.qty || 0),
                inStock: (Number(variant.stock || variant.qty || 0)) > 0,
                isActive: true,
                isSoldConfiguration: variant.isSoldConfiguration === true || variant.isSoldConfiguration === 'true',
              }
            });

            if (variant.attributeValues?.length > 0) {
              await tx.variantAttribute.createMany({
                data: variant.attributeValues.map((av: any) => ({
                  variantId: v.id,
                  attributeId: this.safeNumber(av.attributeId, 'attributeId'),
                  attributeValueId: this.safeNumber(av.attributeValueId, 'attributeValueId'),
                })),
              });
            }

            // Variant Media (Unify and ensure uniqueness)
            const mediaMap = new Map<number, any>();

            // 1. Handle Hero Image (Priority: MAIN type)
            if (variant.heroImageId) {
              const mid = this.safeNumber(variant.heroImageId, 'heroImageId', true);
              if (mid) {
                mediaMap.set(mid, {
                  variantId: v.id,
                  mediaId: mid,
                  type: 'MAIN',
                  sortOrder: 0
                });
              }
            }

            // 1.5 Handle Background Image (Type: HERO_BG)
            if (variant.heroBgImageId) {
              const mid = this.safeNumber(variant.heroBgImageId, 'heroBgImageId', true);
              if (mid && !mediaMap.has(mid)) {
                mediaMap.set(mid, {
                  variantId: v.id,
                  mediaId: mid,
                  type: 'HERO_BG',
                  sortOrder: 0
                });
              }
            }

            // 2. Handle Gallery IDs
            if (variant.galleryIds && Array.isArray(variant.galleryIds)) {
              variant.galleryIds.forEach((mid: any) => {
                const id = this.safeNumber(mid, 'mediaId', true);
                if (id && !mediaMap.has(id)) {
                  mediaMap.set(id, {
                    variantId: v.id,
                    mediaId: id,
                    type: 'GALLERY',
                    sortOrder: mediaMap.size
                  });
                }
              });
            }

            // 3. Handle Gallery objects (new format)
            if (variant.gallery && Array.isArray(variant.gallery)) {
              variant.gallery.forEach((img: any) => {
                const id = this.safeNumber(img.id || img.mediaId, 'mediaId', true);
                if (id && !mediaMap.has(id)) {
                  mediaMap.set(id, {
                    variantId: v.id,
                    mediaId: id,
                    type: 'GALLERY',
                    sortOrder: mediaMap.size
                  });
                }
              });
            }

            const variantMedia = Array.from(mediaMap.values());
            if (variantMedia.length > 0) {
              await tx.variantImage.createMany({ data: variantMedia });
            }
          }
        }

        return { ...product, images: this.parseJson(product.images) };
      });
    } catch (error) {
      this.handlePrismaError(error, 'Create Product');
    }
  }

  async getAllProducts(filters: any = {}) {
    try {
      const {
        search,
        categoryId,
        minPrice,
        maxPrice,
        sort,
        status,
        page = 1,
        limit = 100, // Increased default limit for admin lists
      } = filters;

    const where: Prisma.ProductWhereInput = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    if (categoryId) {
      where.mainCategoryId = Number(categoryId);
    }



    if (minPrice !== undefined || maxPrice !== undefined) {
      where.sellingPrice = {};
      if (minPrice !== undefined) where.sellingPrice.gte = Number(minPrice);
      if (maxPrice !== undefined) where.sellingPrice.lte = Number(maxPrice);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'price_asc':
          orderBy = { sellingPrice: 'asc' };
          break;
        case 'price_desc':
          orderBy = { sellingPrice: 'desc' };
          break;
        case 'bestseller':
          orderBy = { isBestseller: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
      }
    }

    const skip = (page - 1) * limit;

    console.log('getAllProducts filters:', filters);
    console.log('getAllProducts where clause:', JSON.stringify(where, (key, value) => typeof value === 'number' ? value.toString() : value));

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {

          mainCategory: true,
          taxClass: true,
          variants: {
            include: {
              variantAttributes: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true
                    }
                  }
                }
              },
              variantImages: {
                include: {
                  media: true
                }
              }
            }
          },
          specifications: {
            include: {
              specification: {
                include: {
                  groups: {
                    include: {
                      group: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: { 
              variants: true,
              productMedia: true,
              orderItems: true
            }
          },
          orderItems: {
            include: {
              productVariant: {
                include: {
                  variantImages: {
                    include: {
                      media: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          productMedia: {
            include: {
              media: true
            }
          },
        },
      }),
    ]);

    const mappedProducts = products.map(p => ({
      ...p,
      images: this.parseJson(p.images),
      isActive: p.status === 'active' || p.status === '1',
      stock: p.qty, // Map qty to stock for frontend consistency
      soldCount: (p as any).orderItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0,
    }));

      return {
        success: true,
        data: mappedProducts,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.handlePrismaError(error, 'Get All Products');
    }
  }

  async getFeaturedProducts() {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, status: 'active' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {

        mainCategory: true,
        variants: {
          include: {
            variantImages: {
              include: {
                media: true
              }
            }
          }
        },
        specifications: {
          include: {
            specification: {
              include: {
                groups: {
                  include: {
                    group: true
                  }
                }
              }
            }
          }
        },
        productMedia: {
          include: {
            media: true
          }
        },
      },
    });

    return {
      success: true,
      data: products.map(p => ({ 
        ...p, 
        images: this.parseJson(p.images),
        isActive: true 
      })),
    };
  }

  async getProductById(idOrSlug: string) {
    const isId = /^\d+$/.test(idOrSlug);
    
    const product = await this.prisma.product.findUnique({
      where: isId ? { id: Number(idOrSlug) } : { slug: idOrSlug },
      include: {

        mainCategory: true,
        taxClass: true,
        variants: {
          include: {
            variantAttributes: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true
                  }
                }
              }
            },
            variantImages: {
              include: {
                media: true
              }
            }
          }
        },
        specifications: {
          include: {
            specification: {
              include: {
                groups: {
                  include: {
                    group: true
                  }
                }
              }
            }
          }
        },
        productMedia: {
          include: {
            media: true
          }
        },
        orderItems: {
          select: {
            quantity: true
          }
        },
        _count: {
          select: {
            variants: true,
            productMedia: true
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundException(`Product with identifier ${idOrSlug} not found.`);
    }

    // Aggregate Ratings
    const stats = await this.prisma.productReview.aggregate({
      where: { productId: product.id, status: 'approved' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      ...product,
      images: this.parseJson(product.images),
      isActive: product.status === 'active' || product.status === '1',
      averageRating: stats._avg.rating || 0,
      reviewCount: stats._count.rating || 0,
      soldCount: (product as any).orderItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0,
    };
  }

  async getProductsByCategory(categorySlug: string, filters: any = {}) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(`Category ${categorySlug} not found.`);
    }

    return this.getAllProducts({ ...filters, categoryId: category.id.toString() });
  }



  async updateProduct(id: string | number, dto: UpdateProductDto, imageFiles?: Array<Express.Multer.File>) {
    try {
      const productId = this.safeNumber(id, 'productId', true) as number;
      const { 
        mainCategoryId, 
        isActive, 
        categoryId,
        taxClassId,
        shortDesc,
        specifications, 
        tagIds, 
        variants,
        gallery,
        ...rest 
      } = dto as any;

      const prismaData: any = { ...rest };

      if (isActive !== undefined) {
        prismaData.status = isActive ? 'active' : 'inactive';
      }

      if (rest.price !== undefined) prismaData.price = Number(rest.price);
      if (rest.specialPrice !== undefined) prismaData.specialPrice = rest.specialPrice ? Number(rest.specialPrice) : null;
      

      if (taxClassId !== undefined) prismaData.taxClassId = this.safeNumber(taxClassId, 'taxClassId');
      if (mainCategoryId !== undefined || categoryId !== undefined) {
        const catId = mainCategoryId || categoryId;
        prismaData.mainCategoryId = this.safeNumber(catId, 'mainCategoryId');
      }

      if (shortDesc && !rest.shortDescription) {
        prismaData.shortDescription = shortDesc;
      }

      if (imageFiles && imageFiles.length > 0) {
        const savedMedia = await Promise.all(
          imageFiles.map(file => this.mediaService.saveUploadedFile(file))
        );
        prismaData.images = JSON.stringify(savedMedia.map(m => `/uploads/${m.data.fileName}`));
      } else if (gallery) {
        prismaData.images = JSON.stringify(gallery.map((g: any) => typeof g === 'string' ? g : g.url));
      } else if (prismaData.images !== undefined && typeof prismaData.images !== 'string') {
        prismaData.images = JSON.stringify(prismaData.images);
      }

      const validFields = [
        'name', 'slug', 'sku', 'productCode', 'productType', 'description', 'shortDescription',
        'price', 'sellingPrice', 'specialPrice', 'specialPriceStart', 'specialPriceEnd',
        'manageStock', 'qty', 'inStock', 'codAvailable', 'status', 'heroImage',
        'isFeatured', 'isNew', 'isBestseller', 'weight', 'length', 'width', 'height',
        'metaTitle', 'metaDescription', 'metaKeywords', 'mainCategoryId', 'taxClassId',
        'theme', 'subtitle', 'tagline', 'heritageText', 'videoUrl', 'bgColor', 'accentColor', 'textColor', 
        'gradient', 'mistColor', 'images', 'discoverHeroBgImage'
      ];

      const filteredPrismaData: any = {};
      validFields.forEach(field => {
        if (prismaData[field] !== undefined) filteredPrismaData[field] = prismaData[field];
      });

      if (filteredPrismaData.slug) {
        let baseSlug = filteredPrismaData.slug;
        let finalSlug = baseSlug;
        let slugExists = await this.prisma.product.findFirst({ where: { slug: finalSlug, id: { not: productId } } });
        let counter = 1;
        while (slugExists) {
          finalSlug = `${baseSlug}-${counter}`;
          slugExists = await this.prisma.product.findFirst({ where: { slug: finalSlug, id: { not: productId } } });
          counter++;
        }
        filteredPrismaData.slug = finalSlug;
      }

      return await this.prisma.$transaction(async (tx) => {
        // 1. Update Basic Info
        const product = await tx.product.update({
          where: { id: productId },
          data: filteredPrismaData,
        });

        // 2. Update Specifications
        if (specifications !== undefined) {
          await tx.productSpecification.deleteMany({ where: { productId } });
          if (specifications.length > 0) {
            const specData = specifications
              .map((spec: any) => ({
                productId,
                specificationId: this.safeNumber(spec.specificationId, 'specificationId'),
                value: spec.value || '',
                specificationValueId: this.safeNumber(spec.specificationValueId, 'specificationValueId'),
              }))
              .filter((s: any) => s.specificationId !== null);

            if (specData.length > 0) {
              await tx.productSpecification.createMany({ data: specData as any });
            }
          }
        }

        // 3. Update Tags
        if (tagIds !== undefined) {
          await tx.productTag.deleteMany({ where: { productId } });
          if (tagIds.length > 0) {
            const tagData = tagIds
              .map((tagId: any) => ({
                productId,
                tagId: this.safeNumber(tagId, 'tagId'),
              }))
              .filter((t: any) => t.tagId !== null);

            if (tagData.length > 0) {
              await tx.productTag.createMany({ data: tagData as any });
            }
          }
        }

        // 3.5 Update Product Default Media (Diffing Logic)
        const heroImageId = (dto as any).heroImageId;
        const galleryIds = (dto as any).galleryIds;

        if (heroImageId !== undefined || galleryIds !== undefined) {
          const incomingMedia: { mediaId: number, type: string, sortOrder: number }[] = [];
          
          if (heroImageId) {
            const bmid = this.safeNumber(heroImageId, 'heroImageId');
            if (bmid) {
              incomingMedia.push({ mediaId: bmid, type: 'MAIN', sortOrder: 0 });
            }
          }
          
          if (galleryIds && Array.isArray(galleryIds)) {
            galleryIds.forEach((mid: any) => {
              const bmid = this.safeNumber(mid, 'mediaId');
              if (bmid) {
                // Avoid duplication if already MAIN
                if (!incomingMedia.find(m => m.mediaId === bmid)) {
                  incomingMedia.push({ mediaId: bmid, type: 'GALLERY', sortOrder: incomingMedia.length });
                }
              }
            });
          }

          const existingMedia = await tx.productMedia.findMany({ where: { productId } });
          const existingMap = new Map(existingMedia.map(m => [`${m.mediaId}-${m.type}`, m]));
          
          const toDelete = existingMedia.filter(em => !incomingMedia.some(im => im.mediaId === em.mediaId && im.type === em.type));
          const toCreate = incomingMedia.filter(im => !existingMedia.some(em => em.mediaId === im.mediaId && em.type === im.type));
          const toUpdate = incomingMedia.filter(im => {
            const em = existingMap.get(`${im.mediaId}-${im.type}`);
            return em && em.sortOrder !== im.sortOrder;
          });

          if (toDelete.length > 0) {
            await tx.productMedia.deleteMany({
              where: { id: { in: toDelete.map(m => m.id) } }
            });
          }

          if (toCreate.length > 0) {
            await tx.productMedia.createMany({
              data: toCreate.map(im => ({ ...im, productId }))
            });
          }

          for (const up of toUpdate) {
            const em = existingMap.get(`${up.mediaId}-${up.type}`);
            if (em) {
              await tx.productMedia.update({
                where: { id: em.id },
                data: { sortOrder: up.sortOrder }
              });
            }
          }
        }

        // 4. Update Variants
        if (variants !== undefined) {
          const currentVariants = await tx.productVariant.findMany({ 
            where: { productId },
            select: { id: true }
          });
          const currentIds = currentVariants.map(v => v.id);
          const incomingIds = variants
            .filter((v: any) => v.id && !v.id.toString().includes('.'))
            .map((v: any) => this.safeNumber(v.id, 'variantId'))
            .filter(Boolean);

          const toDelete = currentIds.filter(id => !incomingIds.includes(id));
          if (toDelete.length > 0) {
            await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
          }

          for (const variant of variants) {
            const isNew = !variant.id || variant.id.toString().includes('.');
            const variantData: any = {
              sku: variant.sku || `VAR-${Date.now()}-${Math.random()}`,
              price: Number(variant.price || 0),
              comparePrice: variant.comparePrice ? Number(variant.comparePrice) : null,
              sellingPrice: Number(variant.price || 0),
              qty: Number(variant.stock) || 0,
              inStock: (Number(variant.stock) || 0) > 0,
              isActive: true,
              isSoldConfiguration: variant.isSoldConfiguration === true || variant.isSoldConfiguration === 'true',
            };

            let v;
            if (isNew) {
              v = await tx.productVariant.create({
                data: { ...variantData, productId: productId as number }
              });
            } else {
              v = await tx.productVariant.update({
                where: { id: this.safeNumber(variant.id, 'variantId', true) as number },
                data: variantData
              });
              await tx.variantAttribute.deleteMany({ where: { variantId: v.id } });
              await tx.variantImage.deleteMany({ where: { variantId: v.id } });
            }

            if (variant.attributeValues?.length > 0) {
              await tx.variantAttribute.createMany({
                data: variant.attributeValues.map((av: any) => ({
                  variantId: v.id,
                  attributeId: this.safeNumber(av.attributeId, 'attributeId'),
                  attributeValueId: this.safeNumber(av.attributeValueId, 'attributeValueId'),
                })),
              });
            }

            // Sync Images (Unify and ensure uniqueness)
            const mediaMap = new Map<number, any>();

            // 1. Handle Hero Image (Priority: MAIN type)
            if (variant.heroImageId) {
              const mid = this.safeNumber(variant.heroImageId, 'heroImageId', true);
              if (mid) {
                mediaMap.set(mid, {
                  variantId: v.id,
                  mediaId: mid,
                  type: 'MAIN',
                  sortOrder: 0
                });
              }
            }

            // 1.5 Handle Background Image (Type: HERO_BG)
            if (variant.heroBgImageId) {
              const mid = this.safeNumber(variant.heroBgImageId, 'heroBgImageId', true);
              if (mid && !mediaMap.has(mid)) {
                mediaMap.set(mid, {
                  variantId: v.id,
                  mediaId: mid,
                  type: 'HERO_BG',
                  sortOrder: 0
                });
              }
            }

            // 2. Handle Gallery IDs
            if (variant.galleryIds && Array.isArray(variant.galleryIds)) {
              variant.galleryIds.forEach((mid: any) => {
                const id = this.safeNumber(mid, 'mediaId', true);
                if (id && !mediaMap.has(id)) {
                  mediaMap.set(id, {
                    variantId: v.id,
                    mediaId: id,
                    type: 'GALLERY',
                    sortOrder: mediaMap.size
                  });
                }
              });
            }

            // 3. Handle Gallery objects (new format)
            if (variant.gallery && Array.isArray(variant.gallery)) {
              variant.gallery.forEach((img: any) => {
                const id = this.safeNumber(img.id || img.mediaId, 'mediaId', true);
                if (id && !mediaMap.has(id)) {
                  mediaMap.set(id, {
                    variantId: v.id,
                    mediaId: id,
                    type: 'GALLERY',
                    sortOrder: mediaMap.size
                  });
                }
              });
            }

            const variantMedia = Array.from(mediaMap.values());
            if (variantMedia.length > 0) {
              await tx.variantImage.createMany({ data: variantMedia });
            }
          }
        }

        return { ...product, images: this.parseJson(product.images) };
      });
    } catch (error) {
      this.handlePrismaError(error, 'Update Product');
    }
  }

  async deleteProduct(id: string | number) {
    try {
      await this.prisma.product.delete({
        where: { id: Number(id) },
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found.`);
        }
      }
      throw error;
    }
  }

  async getProductVariants(productId: string | number) {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId: Number(productId) },
      include: {
        variantAttributes: {
          include: {
            attributeValue: true
          }
        },
        variantImages: {
          include: {
            media: true
          }
        }
      }
    });
    return { success: true, data: variants };
  }

  async getAllVariants(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    
    const [total, variants] = await Promise.all([
      this.prisma.productVariant.count(),
      this.prisma.productVariant.findMany({
        skip,
        take: limit,
        include: {
          product: { select: { name: true, sku: true } },
          variantAttributes: {
            include: {
              attributeValue: {
                include: { attribute: true }
              }
            }
          },
          variantImages: {
            include: { media: true }
          }
        }
      })
    ]);

    return { 
      success: true, 
      data: variants,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit)
      }
    };
  }

  async updateVariant(id: string | number, dto: any) {
    const data: any = { ...dto };
    if (dto.price !== undefined) data.price = Number(dto.price);
    
    try {
      const variant = await this.prisma.productVariant.update({
        where: { id: Number(id) },
        data,
      });
      return { success: true, data: variant };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Variant with ID ${id} not found.`);
        }
      }
      throw error;
    }
  }

  async uploadProductMedia(productId: string | number, files: Array<Express.Multer.File>, type: string) {
    const savedMedia = await Promise.all(
      files.map(file => this.mediaService.saveUploadedFile(file))
    );

    const productMedia = await Promise.all(
      savedMedia.map((m, index) => 
        this.prisma.productMedia.create({
          data: {
            productId: Number(productId),
            mediaId: m.data.id,
            type,
            sortOrder: index
          }
        })
      )
    );

    return { success: true, data: productMedia };
  }

  async uploadVariantMedia(variantId: string | number, files: Array<Express.Multer.File>, type: string) {
    const savedMedia = await Promise.all(
      files.map(file => this.mediaService.saveUploadedFile(file))
    );

    const variantImages = await Promise.all(
      savedMedia.map((m, index) => 
        this.prisma.variantImage.create({
          data: {
            variantId: Number(variantId),
            mediaId: m.data.id,
            type: type?.toUpperCase() || 'GALLERY',
            sortOrder: index
          }
        })
      )
    );

    return { success: true, data: variantImages };
  }

  async getInventory() {
    const inventory = await this.prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        warehouseStocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    return {
      success: true,
      data: inventory.map((v) => ({
        id: v.id.toString(),
        product_name: v.product?.name || 'Unknown Product',
        sku: v.sku || v.product?.sku || 'N/A',
        stock: v.qty,
        reserved: v.reservedQuantity,
        available: v.qty - v.reservedQuantity,
        min_stock: 5,
        warehouse: v.warehouseStocks?.[0]?.warehouse?.name || 'Main Warehouse',
      })),
    };
  }

  async updateInventoryStock(variantId: string | number, qty: number, type: string, note?: string, adminId?: string) {
    const vId = Number(variantId);
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: vId },
    });

    if (!variant) throw new NotFoundException('Variant not found');

    let newQty = variant.qty;
    if (type === 'Add') newQty += qty;
    else if (type === 'Subtract') newQty = Math.max(0, newQty - qty);
    else if (type === 'Set') newQty = qty;

    const [updated] = await this.prisma.$transaction([
      this.prisma.productVariant.update({
        where: { id: vId },
        data: { qty: newQty },
      }),
      this.prisma.stockHistory.create({
        data: {
          productVariantId: vId,
          productId: variant.productId,
          changeType: type,
          quantity: qty,
          oldQuantity: variant.qty,
          newQuantity: newQty,
          reason: note,
          notes: note,
          adminId: adminId ? Number(adminId) : null,
        },
      }),
    ]);

    return { success: true, data: updated };
  }
}


