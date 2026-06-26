import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Body('customerId') bodyId: string, @Query('customerId') queryId: string) {
    const customerId = bodyId || queryId;
    return this.wishlistService.getWishlist(customerId);
  }

  @Post(':variantId')
  async toggleWishlist(@Body('customerId') customerId: string, @Param('variantId') variantId: string) {
    return this.wishlistService.toggleItem(customerId, variantId);
  }

  @Delete()
  async clearWishlist(@Body('customerId') customerId: string) {
    return this.wishlistService.clearWishlist(customerId);
  }
}


