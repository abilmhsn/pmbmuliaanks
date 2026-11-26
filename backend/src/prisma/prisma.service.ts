import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pingInterval: NodeJS.Timeout | null = null;

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.warn('Initial database connection warning (queries will auto-reconnect):', error);
    }

    // Keep-alive heartbeat: menjaga koneksi Supabase Pooler tetap aktif dan tidak diputus saat idle
    this.pingInterval = setInterval(async () => {
      try {
        await this.$queryRaw`SELECT 1`;
      } catch (err: any) {
        this.logger.debug?.('Keep-alive ping reconnected database pool');
      }
    }, 2 * 60 * 1000); // Setiap 2 menit agar koneksi Supabase pooler tidak idle/sleep
    this.pingInterval.unref();
  }

  async onModuleDestroy() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    try {
      await this.$disconnect();
    } catch {}
  }
}
