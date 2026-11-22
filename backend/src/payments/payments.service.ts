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

    // Utamakan registrasi pada gelombang aktif terbaru
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        registrations: {
          orderBy: { registeredAt: 'desc' },
          where: { period: { isActive: true } },
          take: 1,
        },
      },
    });

    let registration =
      applicant && applicant.registrations.length > 0
        ? applicant.registrations[0]
        : null;

    // Fallback: jika tidak ada gelombang aktif, ambil registrasi terbaru
    if (!registration) {
      const fallback = await this.prisma.applicant.findUnique({
        where: { userId },
        include: {
          registrations: {
            orderBy: { registeredAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!fallback || fallback.registrations.length === 0) {
        throw new NotFoundException(
          'Pendaftaran tidak ditemukan. Pastikan Anda sudah memilih program studi terlebih dahulu.',
        );
      }

      registration = fallback.registrations[0];
    }

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
    // Utamakan pembayaran pada registrasi gelombang aktif terbaru
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        registrations: {
          orderBy: { registeredAt: 'desc' },
          where: { period: { isActive: true } },
          take: 1,
          include: { payments: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    if (applicant && applicant.registrations.length > 0) {
      return applicant.registrations[0].payments;
    }

    // Fallback: tampilkan pembayaran dari registrasi terbaru meskipun gelombang sudah tutup
    const fallback = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        registrations: {
          orderBy: { registeredAt: 'desc' },
          take: 1,
          include: { payments: { orderBy: { createdAt: 'desc' } } },
        },
      },
    });

    if (!fallback || fallback.registrations.length === 0) {
      return [];
    }

    return fallback.registrations[0].payments;
  }
}
