import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('banners')
  async getBanners(@Query('position') position?: string) {
    return this.cmsService.getBanners(position);
  }

  @Get('popups')
  async getActivePopups() {
    return this.cmsService.getActivePopups();
  }

  @Get('pages')
  async getAllPages() {
    return this.cmsService.getAllPages();
  }

  @Post('pages')
  async createPage(@Body() data: any) {
    return this.cmsService.createPage(data);
  }

  @Put('pages/:id')
  async updatePage(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updatePage(Number(id), data);
  }

  @Delete('pages/:id')
  async deletePage(@Param('id') id: string) {
    return this.cmsService.deletePage(Number(id));
  }

  // Banners
  @Get('all-banners')
  async getAllBanners() {
    return this.cmsService.getAllBanners();
  }

  @Post('banners')
  async createBanner(@Body() data: any) {
    return this.cmsService.createBanner(data);
  }

  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateBanner(Number(id), data);
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(Number(id));
  }

  // Testimonials
  @Get('testimonials')
  async getTestimonials() {
    return this.cmsService.getTestimonials();
  }

  @Post('testimonials')
  async createTestimonial(@Body() data: any) {
    return this.cmsService.createTestimonial(data);
  }

  @Put('testimonials/:id')
  async updateTestimonial(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateTestimonial(Number(id), data);
  }

  @Delete('testimonials/:id')
  async deleteTestimonial(@Param('id') id: string) {
    return this.cmsService.deleteTestimonial(Number(id));
  }

  // Home Sections
  @Get('home-sections')
  async getHomeSections() {
    return this.cmsService.getHomeSections();
  }

  @Post('home-sections')
  async createHomeSection(@Body() data: any) {
    return this.cmsService.createHomeSection(data);
  }

  @Put('home-sections/:id')
  async updateHomeSection(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateHomeSection(Number(id), data);
  }

  @Delete('home-sections/:id')
  async deleteHomeSection(@Param('id') id: string) {
    return this.cmsService.deleteHomeSection(Number(id));
  }

  // Community Images (Atelier Chronicles)
  @Get('community-images')
  async getCommunityImages() {
    return this.cmsService.getCommunityImages();
  }

  @Get('community-images/all')
  async getAllCommunityImages() {
    return this.cmsService.getAllCommunityImages();
  }

  @Post('community-images')
  async createCommunityImage(@Body() data: any) {
    return this.cmsService.createCommunityImage(data);
  }

  @Put('community-images/:id')
  async updateCommunityImage(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateCommunityImage(Number(id), data);
  }

  @Delete('community-images/:id')
  async deleteCommunityImage(@Param('id') id: string) {
    return this.cmsService.deleteCommunityImage(Number(id));
  }
}


