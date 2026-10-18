import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async getPublic() {
    return this.prisma.announcement.findMany({
      where: { isPublic: true },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getAll() {
    return this.prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' },
    });
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
