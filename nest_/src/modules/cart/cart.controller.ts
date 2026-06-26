import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Body('userId') bodyUserId: string, @Query('userId') queryUserId: string) {
    const userId = bodyUserId || queryUserId;
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(
    @Body('userId') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Patch('items/:id')
  async updateItem(
    @Body('userId') userId: string,
    @Param('id') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, itemId, updateCartItemDto);
  }

  @Delete('items/:id')
  async removeItem(
    @Body('userId') userId: string,
    @Param('id') itemId: string,
  ) {
    return this.cartService.removeItem(userId, itemId);
  }

  @Delete()
  async clearCart(@Body('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}


