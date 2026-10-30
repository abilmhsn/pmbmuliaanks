
import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DocumentType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly storageService: SupabaseStorageService,
  ) { }

  @Get()
  async getMyDocuments(@CurrentUser('id') userId: string) {
    return this.documentsService.getMyDocuments(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @CurrentUser('id') userId: string,
    @Body('type') type: DocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File wajib diunggah');
    }

    if (!type) {
      throw new BadRequestException(
        'Tipe dokumen (FOTO, KTP, IJAZAH, dll) wajib ditentukan',
      );
    }

    const filePath = await this.storageService.uploadFile(file, 'documents');

    return this.documentsService.uploadDocument(
      userId,
      type,
      file,
      filePath,
    );
  }
}
