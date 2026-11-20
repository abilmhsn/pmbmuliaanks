import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { NewsStatus, Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Helper mengubah string judul menjadi format slug URL ramah SEO
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Hapus diakritik/aksen
      .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter selain huruf, angka, spasi, dash
      .replace(/[\s_-]+/g, '-') // Ganti spasi & underscore jadi dash
      .replace(/^-+|-+$/g, ''); // Hapus dash di awal/akhir
  }

  /**
   * Memastikan slug yang dihasilkan unik di dalam database
   */
  private async ensureUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
    let slug = baseSlug || 'berita';
    let counter = 1;

    while (true) {
      const existing = await this.prisma.news.findUnique({
        where: { slug },
      });

      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * GET /news - Daftar berita publik (Hanya status PUBLISHED)
   */
  async getPublicNews(query: QueryNewsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 9));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {
      status: NewsStatus.PUBLISHED,
    };

    if (query.search && query.search.trim() !== '') {
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { excerpt: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          imageUrl: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /news/:slug - Detail berita publik berdasarkan slug
   */
  async getPublicNewsBySlug(slug: string) {
    const news = await this.prisma.news.findFirst({
      where: {
        slug,
        status: NewsStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Berita tidak ditemukan atau belum dipublikasikan');
    }

    // Ambil 3 berita terbaru lainnya sebagai rekomendasi
    const recentNews = await this.prisma.news.findMany({
      where: {
        status: NewsStatus.PUBLISHED,
        id: { not: news.id },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
      },
    });

    return {
      news,
      recentNews,
    };
  }

  /**
   * GET /news/admin/all - Seluruh daftar berita untuk Super Admin
   */
  async getAllAdminNews(query: QueryNewsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {};

    if (query.status && ['DRAFT', 'PUBLISHED'].includes(query.status.toUpperCase())) {
      where.status = query.status.toUpperCase() as NewsStatus;
    }

    if (query.search && query.search.trim() !== '') {
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { excerpt: { contains: query.search.trim(), mode: 'insensitive' } },
        { slug: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * GET /news/admin/:id - Ambil satu berita untuk form edit Super Admin
   */
  async getNewsById(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true },
        },
      },
    });

    if (!news) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    return news;
  }

  /**
   * POST /news - Tambah berita baru oleh Super Admin
   */
  async createNews(dto: CreateNewsDto, user: any) {
    const rawSlug = dto.slug && dto.slug.trim() !== '' ? dto.slug : dto.title;
    const cleanSlug = this.generateSlug(rawSlug);
    const finalSlug = await this.ensureUniqueSlug(cleanSlug);

    const status = dto.status || NewsStatus.DRAFT;
    let publishedAt: Date | null = null;

    if (status === NewsStatus.PUBLISHED) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : new Date();
    } else if (dto.publishedAt) {
      publishedAt = new Date(dto.publishedAt);
    }

    const created = await this.prisma.news.create({
      data: {
        title: dto.title.trim(),
        slug: finalSlug,
        excerpt: dto.excerpt?.trim() || null,
        content: dto.content,
        imageUrl: dto.imageUrl?.trim() || null,
        status,
        publishedAt,
        authorId: user?.id || null,
      },
    });

    // Catat ke Audit Log jika tersedia
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          userEmail: user?.email,
          action: 'CREATE_NEWS',
          target: `Berita: ${created.title}`,
          details: `Menambahkan berita baru status ${status} (Slug: ${created.slug})`,
        },
      });
    } catch (e) {
      console.warn('Gagal mencatat audit log create_news:', e);
    }

    return created;
  }

  /**
   * PATCH /news/:id - Ubah berita oleh Super Admin
   */
  async updateNews(id: string, dto: UpdateNewsDto, user: any) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    let finalSlug = existing.slug;
    if (dto.slug && dto.slug.trim() !== '' && dto.slug !== existing.slug) {
      finalSlug = await this.ensureUniqueSlug(this.generateSlug(dto.slug), id);
    } else if (dto.title && (!dto.slug || dto.slug.trim() === '') && dto.title !== existing.title) {
      // Jika judul berubah dan slug tidak dikunci khusus
      finalSlug = await this.ensureUniqueSlug(this.generateSlug(dto.title), id);
    }

    // Jika gambar cover diganti, bersihkan gambar lama dari Supabase Storage
    if (dto.imageUrl && existing.imageUrl && dto.imageUrl !== existing.imageUrl) {
      await this.storageService.deleteNewsImage(existing.imageUrl);
    }

    const nextStatus = dto.status || existing.status;
    let nextPublishedAt = existing.publishedAt;

    if (dto.publishedAt !== undefined) {
      nextPublishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (nextStatus === NewsStatus.PUBLISHED && !existing.publishedAt) {
      nextPublishedAt = new Date();
    }

    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        title: dto.title !== undefined ? dto.title.trim() : existing.title,
        slug: finalSlug,
        excerpt: dto.excerpt !== undefined ? (dto.excerpt?.trim() || null) : existing.excerpt,
        content: dto.content !== undefined ? dto.content : existing.content,
        imageUrl: dto.imageUrl !== undefined ? (dto.imageUrl?.trim() || null) : existing.imageUrl,
        status: nextStatus,
        publishedAt: nextPublishedAt,
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          userEmail: user?.email,
          action: 'UPDATE_NEWS',
          target: `Berita: ${updated.title}`,
          details: `Memperbarui berita status ${updated.status}`,
        },
      });
    } catch (e) {
      console.warn('Gagal mencatat audit log update_news:', e);
    }

    return updated;
  }

  /**
   * DELETE /news/:id - Hapus berita oleh Super Admin
   */
  async deleteNews(id: string, user: any) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Berita tidak ditemukan');
    }

    // Bersihkan gambar cover jika tersimpan di Supabase Storage
    if (existing.imageUrl) {
      await this.storageService.deleteNewsImage(existing.imageUrl);
    }

    const deleted = await this.prisma.news.delete({ where: { id } });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: user?.id,
          userEmail: user?.email,
          action: 'DELETE_NEWS',
          target: `Berita: ${existing.title}`,
          details: `Menghapus berita ID ${existing.id}`,
        },
      });
    } catch (e) {
      console.warn('Gagal mencatat audit log delete_news:', e);
    }

    return {
      message: 'Berita berhasil dihapus',
      id: deleted.id,
    };
  }

  /**
   * Upload gambar cover atau inline berita ke Supabase Storage
   */
  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new ConflictException('File gambar wajib diunggah');
    }

    // Validasi tipe file
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMime.includes(file.mimetype)) {
      throw new ConflictException('Format file tidak didukung. Harap unggah JPEG, PNG, WEBP, atau GIF');
    }

    // Validasi ukuran max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new ConflictException('Ukuran gambar tidak boleh melebihi 5MB');
    }

    const publicUrl = await this.storageService.uploadNewsImage(file);
    return {
      url: publicUrl,
    };
  }
}
