import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, RateLimitRecord>();
  private readonly limit = 30; // Maksimal 30 request per menit (aman untuk multi-tab & testing)
  private readonly ttlMs = 60 * 1000; // per 1 menit (60 detik)

  constructor() {
    // Bersihkan memori setiap 5 menit agar tidak terjadi memory leak
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (now > record.resetAt) {
          this.hits.delete(key);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `${clientIp}:${req.method}:${req.path}`;
    const now = Date.now();
    const record = this.hits.get(key);

    if (!record || now > record.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.ttlMs });
      return true;
    }

    if (record.count >= this.limit) {
      const secondsLeft = Math.ceil((record.resetAt - now) / 1000);
      throw new HttpException(
        `Terlalu banyak percobaan request. Silakan tunggu ${secondsLeft} detik lagi.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
