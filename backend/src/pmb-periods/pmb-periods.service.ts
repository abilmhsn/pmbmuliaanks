import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmbPeriodsService {
  constructor(private prisma: PrismaService) { }

  async getActive() {
    try {
      return await this.prisma.pmbPeriod.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch active PMB period from DB:', err?.message || err);
      return null;
    }
  }

  async getAll() {
    try {
      return await this.prisma.pmbPeriod.findMany({
        include: {
          _count: {
            select: { registrations: true },
          },
        },
        orderBy: [
          { year: 'desc' },
          { startDate: 'asc' },
        ],
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch PMB periods from DB:', err?.message || err);
      return [];
    }
  }

  async create(data: {
    year: string;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
    isActive?: boolean;
  }) {
    const cleanYear = (data.year || '').trim();
    const cleanName = (data.name || '').trim();

    if (!cleanYear || !cleanName) {
      throw new BadRequestException('Tahun akademik dan nama gelombang wajib diisi.');
    }

    if (!/^\d{4}\/\d{4}$/.test(cleanYear)) {
      throw new BadRequestException('Format tahun akademik harus YYYY/YYYY (contoh: 2026/2027).');
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Tanggal mulai dan tanggal berakhir gelombang tidak valid.');
    }

    if (end < start) {
      throw new BadRequestException('Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.');
    }

    // Cegah duplikasi nama gelombang di tahun akademik yang sama
    const duplicate = await this.prisma.pmbPeriod.findFirst({
      where: {
        year: cleanYear,
        name: { equals: cleanName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        `${cleanName} untuk Tahun Akademik ${cleanYear} sudah terdaftar. Silakan ubah jadwal yang ada.`,
      );
    }

    const shouldActivate = data.isActive !== undefined ? Boolean(data.isActive) : true;

    return this.prisma.$transaction(async (tx) => {
      if (shouldActivate) {
        await tx.pmbPeriod.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.pmbPeriod.create({
        data: {
          year: cleanYear,
          name: cleanName,
          startDate: start,
          endDate: end,
          isActive: shouldActivate,
        },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });
    });
  }

  async update(
    id: string,
    data: Partial<{
      year: string;
      name: string;
      startDate: string | Date;
      endDate: string | Date;
      isActive: boolean;
    }>,
  ) {
    const existing = await this.prisma.pmbPeriod.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Periode gelombang PMB tidak ditemukan.');
    }

    const nextYear = data.year !== undefined ? data.year.trim() : existing.year;
    const nextName = data.name !== undefined ? data.name.trim() : existing.name;

    if (!/^\d{4}\/\d{4}$/.test(nextYear)) {
      throw new BadRequestException('Format tahun akademik harus YYYY/YYYY (contoh: 2026/2027).');
    }

    const nextStart = data.startDate ? new Date(data.startDate) : existing.startDate;
    const nextEnd = data.endDate ? new Date(data.endDate) : existing.endDate;

    if (isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime())) {
      throw new BadRequestException('Tanggal mulai atau berakhir tidak valid.');
    }

    if (nextEnd < nextStart) {
      throw new BadRequestException('Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.');
    }

    // Pastikan tidak bentrok dengan gelombang lain di tahun akademik yang sama
    const duplicate = await this.prisma.pmbPeriod.findFirst({
      where: {
        id: { not: id },
        year: nextYear,
        name: { equals: nextName, mode: 'insensitive' },
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        `${nextName} untuk Tahun Akademik ${nextYear} sudah ada.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.isActive === true) {
        await tx.pmbPeriod.updateMany({
          where: { isActive: true, id: { not: id } },
          data: { isActive: false },
        });
      }

      return tx.pmbPeriod.update({
        where: { id },
        data: {
          year: nextYear,
          name: nextName,
          startDate: nextStart,
          endDate: nextEnd,
          isActive: data.isActive !== undefined ? data.isActive : undefined,
        },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });
    });
  }
}