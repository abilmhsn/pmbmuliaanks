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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as fs from 'fs';

const paymentDir = join(process.cwd(), 'uploads', 'payments');
if (!fs.existsSync(paymentDir)) {
  fs.mkdirSync(paymentDir, { recursive: true });
}

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async getMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.getMyPayments(userId);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: paymentDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `payment-${uniqueSuffix}${ext}`);
        },
      }),
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
    return this.paymentsService.submitPaymentProof(userId, amount, paymentType, file);
  }
}
