import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { LoyaltyService } from './loyalty.service';
import { ValidateCouponDto, ApplyCouponDto } from './dto/marketing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('marketing')
export class MarketingController {
  constructor(
    private readonly marketingService: MarketingService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  @Post('coupons/validate')
  async validateCoupon(
    @GetUser('userId') userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    return this.marketingService.validateCoupon(userId, dto.code, dto.cartAmount);
  }

  @Get('loyalty/balance')
  async getLoyaltyBalance(@GetUser('userId') userId: string) {
    return this.loyaltyService.getLoyaltyBalance(userId);
  }

  // Offer CRUD for Admin
  @Get('offers/analytics')
  async getOffersAnalytics() {
    return this.marketingService.getAnalyticsDashboard();
  }

  @Get('offers')
  async getOffers() {
    return this.marketingService.getAllOffers();
  }

  @Post('offers')
  async createOffer(@Body() data: any) {
    return this.marketingService.createOffer(data);
  }

  @Put('offers/:id')
  async updateOffer(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateOffer(id, data);
  }

  @Delete('offers/:id')
  async deleteOffer(@Param('id') id: string) {
    return this.marketingService.deleteOffer(id);
  }
}


