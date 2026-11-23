
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly userCache = new Map<string, { user: any; expiresAt: number }>();
  private readonly cacheTtlMs = 30 * 1000; // Maksimal 30 detik cache

  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {
    // Pembersihan entri cache kedaluwarsa secara berkala setiap 5 menit
    setInterval(() => {
      const now = Date.now();
      for (const [token, item] of this.userCache.entries()) {
        if (now > item.expiresAt) {
          this.userCache.delete(token);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  /**
   * Helper membaca klaim exp (expiration) dari payload JWT tanpa verifikasi kriptografi.
   * Hanya digunakan untuk membatasi masa berlaku cache agar tidak melebihi masa aktif token.
   */
  private getTokenExpirationMs(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);
      if (typeof payload.exp === 'number' && payload.exp > 0) {
        return payload.exp * 1000;
      }
      return null;
    } catch {
      return null;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan');
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan');
    }

    const now = Date.now();
    const cached = this.userCache.get(token);
    if (cached && now < cached.expiresAt) {
      request.user = cached.user;
      return true;
    }

    // 1. Verifikasi token Supabase
    let sbUser;
    try {
      sbUser = await this.supabaseService.verifyToken(token);
    } catch (error) {
      this.userCache.delete(token);
      throw error;
    }

    // 2. Cari user di database melalui Prisma hanya berdasarkan ID resmi Supabase (tanpa fallback email)
    let user;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: sbUser.id },
        include: { applicant: true },
      });
    } catch (error) {
      console.error(
        '[AUTH ERROR] Pencarian user Prisma gagal:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan dalam sistem PMB');
    }

    // 3. Simpan informasi user ke request & simpan ke cache dengan batas waktu terikat masa aktif JWT
    const requestUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      applicantId: user.applicant?.id || null,
      applicant: user.applicant,
    };

    const tokenExpMs = this.getTokenExpirationMs(token);
    if (tokenExpMs && tokenExpMs > now) {
      const cacheExpiresAt = Math.min(now + this.cacheTtlMs, tokenExpMs);
      this.userCache.set(token, {
        user: requestUser,
        expiresAt: cacheExpiresAt,
      });
    }

    request.user = requestUser;
    return true;
  }
}
