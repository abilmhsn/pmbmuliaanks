import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar dalam sistem');
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate unique registration number PMB-{YEAR}-{RANDOM} dengan retry untuk mencegah collision
    const year = new Date().getFullYear();
    let user: any = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit → 900.000 kombinasi
      const regNumber = `PMB-${year}-${randomNum}`;

      try {
        // Create user & applicant in a transaction
        user = await this.prisma.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
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
        break; // sukses, keluar dari loop
      } catch (err: any) {
        // P2002 = unique constraint violation (nomor pendaftaran tabrakan)
        if (err?.code === 'P2002') {
          lastError = err;
          continue; // coba lagi dengan nomor baru
        }
        throw err; // error lain langsung lempar
      }
    }

    if (!user) {
      throw new BadRequestException(
        'Gagal membuat akun: nomor pendaftaran tidak bisa di-generate. Silakan coba lagi.',
      );
    }

    // Sign JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Registrasi berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        applicant: user.applicant,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { applicant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        applicant: user.applicant,
      },
    };
  }

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
      throw new UnauthorizedException('Pengguna tidak ditemukan');
    }

    return user;
  }
}