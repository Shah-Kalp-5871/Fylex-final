import { Controller, Get, Post, Param, UploadedFiles, UseInterceptors, Delete, Body } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async getAllMedia() {
    return this.mediaService.getAllMedia();
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file', 500, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadMedia(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('category') category?: string,
    @Body('paths') pathsStr?: string
  ) {
    let paths: string[] = [];
    if (pathsStr) {
      try {
        paths = JSON.parse(pathsStr);
      } catch {
        paths = [];
      }
    }
    return this.mediaService.uploadMultiple(files, category, paths);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}


