import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyProgramsService {
  constructor(private prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.studyProgram.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.studyProgram.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async create(data: { code: string; name: string; description?: string; quota?: number; tuitionFee?: number }) {
    return this.prisma.studyProgram.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        quota: data.quota || 50,
        tuitionFee: data.tuitionFee || 0,
      },
    });
  }

  async update(id: string, data: Partial<{ code: string; name: string; description: string; quota: number; tuitionFee: number; isActive: boolean }>) {
    return this.prisma.studyProgram.update({
      where: { id },
      data,
    });
  }
}
