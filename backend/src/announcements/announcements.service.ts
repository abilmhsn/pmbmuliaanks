import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async getPublic() {
    try {
      return await this.prisma.announcement.findMany({
        where: { isPublic: true },
        orderBy: { publishedAt: 'desc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch public announcements from DB:', err?.message || err);
      return [];
    }
  }

  async getAll() {
    try {
      return await this.prisma.announcement.findMany({
        orderBy: { publishedAt: 'desc' },
      });
    } catch (err: any) {
      console.warn('Warning: Failed to fetch announcements from DB:', err?.message || err);
      return [];
    }
  }

  async create(title: string, content: string, isPublic = true) {
    return this.prisma.announcement.create({
      data: { title, content, isPublic },
    });
  }

  async delete(id: string) {
    return this.prisma.announcement.delete({
      where: { id },
    });
  }
}
