import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmbPeriodsService {
  constructor(private prisma: PrismaService) { }

  async getActive() {
    return this.prisma.pmbPeriod.findFirst({
      where: { isActive: true },
    });
  }

  async getAll() {
    return this.prisma.pmbPeriod.findMany({
      orderBy: { startDate: 'desc' },
    });
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

