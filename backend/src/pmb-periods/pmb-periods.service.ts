import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmbPeriodsService {
  constructor(private prisma: PrismaService) { }

  async getActive() {
    try {
      return await this.prisma.pmbPeriod.findFirst({
        where: { isActive: true },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch active PMB period from DB:', err?.message || err);
      return null;
    }
  }

  async getAll() {
    try {
      return await this.prisma.pmbPeriod.findMany({
        orderBy: { startDate: 'desc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch PMB periods from DB:', err?.message || err);
      return [];
    }
  }

  async create(data: { year: string; name: string; startDate: Date; endDate: Date; isActive?: boolean }) {
    if (data.isActive) {
      await this.prisma.pmbPeriod.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.pmbPeriod.create({
      data: {
        year: data.year,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async update(id: string, data: Partial<{ year: string; name: string; startDate: Date; endDate: Date; isActive: boolean }>) {
    if (data.isActive) {
      await this.prisma.pmbPeriod.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    return this.prisma.pmbPeriod.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }
}

