import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

interface CachedToken {
  user: SupabaseUser;
  expiresAt: number;
}

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private readonly tokenCache = new Map<string, CachedToken>();
  private readonly cacheTtlMs = 30 * 1000; // 30 detik TTL

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const secretKey = this.configService.get<string>('SUPABASE_SECRET_KEY');

    if (!url || !secretKey) {
      throw new Error('SUPABASE_URL dan SUPABASE_SECRET_KEY wajib dikonfigurasi di environment variables');
    }

    this.supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Pembersihan memori cache berkala setiap 5 menit
    setInterval(() => {
      const now = Date.now();
      for (const [token, item] of this.tokenCache.entries()) {
        if (now > item.expiresAt) {
          this.tokenCache.delete(token);
        }
      }
    }, 5 * 60 * 1000).unref();
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Helper membaca klaim exp (expiration) dari payload JWT tanpa verifikasi kriptografi.
   * Hanya digunakan untuk membatasi masa berlaku in-memory cache agar tidak melebihi masa aktif token.
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

  /**
   * Verifikasi Access Token Supabase secara aman.
   * Menggunakan in-memory cache maksimal 30 detik (atau mengikuti exp token jika lebih dekat).
   */
  async verifyToken(token: string): Promise<SupabaseUser> {
    if (!token) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan');
    }

    const now = Date.now();
    const cached = this.tokenCache.get(token);
    if (cached && now < cached.expiresAt) {
      return cached.user;
    }

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      this.tokenCache.delete(token);
      throw new UnauthorizedException('Sesi tidak valid atau telah kedaluwarsa');
    }

    // Tentukan masa cache: maksimal 30 detik, atau mengikuti exp token jika lebih dekat
    const tokenExpMs = this.getTokenExpirationMs(token);
    if (tokenExpMs && tokenExpMs > now) {
      const cacheExpiresAt = Math.min(now + this.cacheTtlMs, tokenExpMs);
      this.tokenCache.set(token, {
        user: data.user,
        expiresAt: cacheExpiresAt,
      });
    }

    return data.user;
  }

  /**
   * Registrasi akun baru langsung di Supabase Auth via Admin API
   * Email langsung dikonfirmasi (email_confirm: true) agar pengguna bisa langsung login.
   */
  async adminCreateUser(params: {
    id?: string;
    email: string;
    password: string;
    user_metadata?: Record<string, any>;
  }) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      id: params.id,
      email: params.email,
      password: params.password,
      email_confirm: true,
      user_metadata: params.user_metadata || {},
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  /**
   * Login menggunakan Supabase Auth (Email + Password)
   * Menghasilkan sesi dan access token resmi Supabase.
   */
  async signInWithPassword(credentials: { email: string; password: string }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Perbarui password atau data pengguna di Supabase Auth
   */
  async adminUpdateUser(
    userId: string,
    attributes: { password?: string; email?: string; user_metadata?: Record<string, any> },
  ) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(userId, attributes);
    if (error) {
      throw error;
    }
    return data.user;
  }

  /**
   * Hapus akun pengguna dari Supabase Auth
   */
  async adminDeleteUser(userId: string) {
    const { data, error } = await this.supabase.auth.admin.deleteUser(userId);
    if (error) {
      throw error;
    }
    return data;
  }
}
