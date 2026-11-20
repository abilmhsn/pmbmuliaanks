import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Endpoint Publik: Mengambil berita yang sudah dipublikasikan
   */
  @Get()
  async getPublicNews(@Query() query: QueryNewsDto) {
    return this.newsService.getPublicNews(query);
  }

  /**
   * Endpoint Super Admin: Ambil seluruh berita (Draft & Published)
   * Wajib ditaruh sebelum route dinamis :slug
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('admin/all')
  async getAllAdminNews(@Query() query: QueryNewsDto) {
    return this.newsService.getAllAdminNews(query);
  }

  /**
   * Endpoint Super Admin: Upload file gambar cover berita ke Supabase Storage
   * Wajib ditaruh sebelum route dinamis :slug
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadNewsImage(@UploadedFile() file: Express.Multer.File) {
    return this.newsService.uploadImage(file);
  }

  /**
   * Endpoint Super Admin: Ambil satu berita berdasarkan ID untuk prefill form edit
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('admin/:id')
  async getNewsById(@Param('id') id: string) {
    return this.newsService.getNewsById(id);
  }

  /**
   * Endpoint Publik: Mengambil detail berita berdasarkan slug
   */
  @Get(':slug')
  async getPublicNewsBySlug(@Param('slug') slug: string) {
    return this.newsService.getPublicNewsBySlug(slug);
  }

  /**
   * Endpoint Super Admin: Tambah berita baru
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  async createNews(@Body() dto: CreateNewsDto, @CurrentUser() user: any) {
    return this.newsService.createNews(dto, user);
  }

  /**
   * Endpoint Super Admin: Ubah isi berita
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  async updateNews(
    @Param('id') id: string,
    @Body() dto: UpdateNewsDto,
    @CurrentUser() user: any,
  ) {
    return this.newsService.updateNews(id, dto, user);
  }

  /**
   * Endpoint Super Admin: Hapus berita
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async deleteNews(@Param('id') id: string, @CurrentUser() user: any) {
    return this.newsService.deleteNews(id, user);
  }
}
