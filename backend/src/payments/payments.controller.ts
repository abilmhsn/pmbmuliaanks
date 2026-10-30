
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
import { PaymentsService } from './payments.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly storageService: SupabaseStorageService,
  ) { }

  @Get()
  async getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getMyPayments(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadPaymentProof(
    @CurrentUser('id') userId: string,
    @Body('amount') amount: number,
    @Body('paymentType') paymentType: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Bukti transfer wajib diunggah');
    }

    const filePath = await this.storageService.uploadFile(file, 'payments');


    return this.paymentsService.submitPaymentProof(
      userId,
      amount,
      paymentType,
      file,
      filePath,
    );
  }
}