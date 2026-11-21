import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

  async submitPaymentProof(
    userId: string,
    amount: number,
    paymentType: string,
    file: Express.Multer.File,
    filePath: string,
  ) {
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      throw new BadRequestException('Nominal pembayaran tidak valid');
    }

    if (parsedAmount > 3500000) {
      throw new BadRequestException(
        'Nominal Uang Muka (DP) maksimal Rp 3.500.000',
      );
    }

    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: { registrations: true },
    });

    if (!applicant || applicant.registrations.length === 0) {
      throw new NotFoundException('Pendaftaran tidak ditemukan');
    }

    const registration = applicant.registrations[0];

    return this.prisma.payment.create({
      data: {
        registrationId: registration.id,
        amount: parsedAmount,
        paymentType: paymentType || 'Uang Muka (DP) Pendaftaran PMB',
        proofUrl: filePath,
      },
    });
  }

  async getMyPayments(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        registrations: {
          include: { payments: true },
        },
      },
    });

    if (!applicant || applicant.registrations.length === 0) {
      return [];
    }

    return applicant.registrations[0].payments;
  }
}