import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudyProgramsService {
  constructor(private prisma: PrismaService) {}

  async findAllActive() {
    try {
      return await this.prisma.studyProgram.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch active study programs from DB, using fallback:', err?.message || err);
      return [
        {
          id: 'alc-default',
          code: 'ALC',
          name: 'Air Lines Crew (Pramugari/Pramutra & Staff Bandara)',
          description: 'Program keahlian khusus siap kerja untuk menjadi Cabin Crew (Pramugari/Pramutra) profesional dan Ground Handling Staff Bandara Internasional.',
          quota: 57,
          tuitionFee: 22975000,
          isActive: true,
        },
        {
          id: 'avsec-default',
          code: 'AVSEC',
          name: 'AVSEC (Aviation Security / Keamanan Bandara)',
          description: 'Program pendidikan & pelatihan khusus personel Keamanan Penerbangan (Aviation Security) bersertifikat lisensi resmi.',
          quota: 49,
          tuitionFee: 22975000,
          isActive: true,
        },
      ];
    }
  }

  async findAll() {
    try {
      return await this.prisma.studyProgram.findMany({
        orderBy: { code: 'asc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch all study programs from DB, using fallback:', err?.message || err);
      return this.findAllActive();
    }
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
