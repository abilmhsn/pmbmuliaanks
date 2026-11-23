import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // =========================
  // REGISTER MAHASISWA BARU
  // =========================
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // 1. Cek apakah email sudah terdaftar di database PMB
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar dalam sistem PMB');
    }

    // 2. Buat akun di Supabase Auth via Admin API (Password dikelola 100% oleh Supabase)
    let sbUser: any;
    try {
      sbUser = await this.supabaseService.adminCreateUser({
        email,
        password: dto.password,
        user_metadata: {
          fullName: dto.fullName,
          phone: dto.phone,
        },
      });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered') || msg.includes('unique')) {
        throw new BadRequestException('Email sudah terdaftar di Supabase Auth');
      }
      if (msg.includes('Password should be at least')) {
        throw new BadRequestException('Password minimal 6 karakter');
      }
      throw new BadRequestException(`Gagal mendaftar: ${msg}`);
    }

    // 3. Generate nomor registrasi PMB-{TAHUN}-{6DIGIT} dengan auto-retry
    const year = new Date().getFullYear();
    let user: any = null;
    let createError: any = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const regNumber = `PMB-${year}-${randomNum}`;

      try {
        user = await this.prisma.user.create({
          data: {
            id: sbUser.id, // Sinkronisasi ID dengan Supabase Auth
            email,
            role: Role.APPLICANT,
            applicant: {
              create: {
                fullName: dto.fullName,
                phone: dto.phone,
                registrationNumber: regNumber,
              },
            },
          },
          include: {
            applicant: true,
          },
        });
        break;
      } catch (err: any) {
        if (err?.code === 'P2002') {
          const target = err?.meta?.target;
          if (
            Array.isArray(target) &&
            target.some((field: string) => field.toLowerCase().includes('email'))
          ) {
            // Rollback Supabase user jika email konflik di Prisma
            await this.supabaseService.adminDeleteUser(sbUser.id).catch(() => {});
            throw new BadRequestException('Email sudah terdaftar dalam sistem PMB');
          }
          createError = err;
          continue; // Coba nomor registrasi lain
        }
        createError = err;
        break;
      }
    }

    // Rollback jika pembuatan data profil mahasiswa gagal
    if (!user) {
      await this.supabaseService.adminDeleteUser(sbUser.id).catch(() => {});
      throw new InternalServerErrorException(
        `Gagal membuat data profil mahasiswa: ${createError?.message || 'Nomor pendaftaran tabrakan'}`,
      );
    }

    return {
      message: 'Registrasi berhasil. Silakan login menggunakan email & password Anda.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        applicant: user.applicant,
      },
    };
  }

  // =========================
  // LOGIN (SUPABASE AUTH)
  // =========================
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    // 1. Verifikasi kredensial langsung ke Supabase Auth
    let authData: any;
    try {
      authData = await this.supabaseService.signInWithPassword({
        email,
        password: dto.password,
      });
    } catch (err: any) {
      throw new UnauthorizedException('Email atau password salah');
    }

    if (!authData?.session?.access_token || !authData?.user) {
      throw new UnauthorizedException('Gagal mendapatkan sesi login dari Supabase Auth');
    }

    // 2. Ambil profil user beserta applicant dari database Prisma
    let user = await this.prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { applicant: true },
    });

    // Fallback: Jika ID di Prisma belum sama dengan ID Supabase, sinkronkan berdasarkan email
    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: { applicant: true },
      });

      if (user && user.id !== authData.user.id) {
        // Update User ID di Prisma agar sinkron dengan ID Supabase Auth
        try {
          user = await this.prisma.user.update({
            where: { email },
            data: { id: authData.user.id },
            include: { applicant: true },
          });
        } catch {
          // Jika update ID terhalang foreign key, tetap gunakan record user yang ditemukan
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('Akun ditemukan di Supabase tetapi profil belum terdaftar di sistem PMB');
    }

    return {
      message: 'Login berhasil',
      token: authData.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        applicant: user.applicant,
      },
    };
  }

  // =========================
  // GET PROFILE (/auth/me)
  // =========================
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        applicant: {
          include: {
            personalData: true,
            educationData: true,
            registrations: {
              include: {
                studyProgram: true,
                period: true,
                payments: true,
              },
            },
            documents: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan dalam sistem PMB');
    }

    return user;
  }
}
