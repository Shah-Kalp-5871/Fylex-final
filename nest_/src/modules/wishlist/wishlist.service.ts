import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  // Get or Create wishlist for customer
  private async getOrCreateWishlist(customerId: string | number | number) {
    if (!customerId || customerId === 'undefined' || customerId === 'null' || customerId === '') {
      return { id: Number(0), items: [] as any[], name: 'Default' };
    }

    const customerIdStr = customerId.toString();
    const isNumeric = !isNaN(Number(customerIdStr)) && !customerIdStr.includes('usr_');

    let wishlist = await this.prisma.wishlist.findFirst({
      where: isNumeric 
        ? { customerId: Number(customerIdStr) }
        : { sessionId: customerIdStr },
      include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true,
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
            } 
          },
          orderBy: { id: 'asc' }
        } 
      },
    });

    if (!wishlist) {
      try {
        if (isNumeric) {
          wishlist = await this.prisma.wishlist.create({
            data: { customerId: Number(customerIdStr), name: 'Default' },
            include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true,
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
            } 
          } 
        } 
      },
          });
        } else {
          wishlist = await this.prisma.wishlist.create({
            data: { sessionId: customerIdStr, name: 'Default' },
            include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true,
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
            } 
          } 
        } 
      },
          });
        }
      } catch (err) {
        // Fallback for non-existent numeric users
        wishlist = await this.prisma.wishlist.create({
          data: { sessionId: customerIdStr, name: 'Default' },
          include: { 
        items: { 
          include: { 
            productVariant: { 
              include: { 
                product: true,
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
            } 
          } 
        } 
      },
        });
      }
    }
    return wishlist;
  }

  // Get wishlist
  async getWishlist(customerId: string) {
    return this.getOrCreateWishlist(customerId);
  }

  // Toggle item in wishlist
  async toggleItem(customerId: string, variantId: string) {
    if (!variantId || variantId === 'toggle' || variantId === 'undefined') {
        throw new BadRequestException(`Invalid variantId: ${variantId}`);
    }
    const vId = Number(variantId);
    const wishlist = await this.getOrCreateWishlist(customerId);

    // Check if variant exists
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: vId },
    });
    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Check if already in wishlist
    const existing = await this.prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productVariantId: vId },
    });

    if (existing) {
      await this.prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { added: false };
    }

    await this.prisma.wishlistItem.create({
      data: {
        wishlist: { connect: { id: wishlist.id } },
        productVariant: { connect: { id: vId } },
      },
    });
    return { added: true };
  }

  // Clear wishlist
  async clearWishlist(customerId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId);
    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id },
    });
    return { success: true };
  }
}


