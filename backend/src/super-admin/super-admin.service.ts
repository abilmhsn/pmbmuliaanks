import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, RegistrationStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Catat aktivitas penting ke audit trail
   */
  async logAction(data: {
    userId?: string;
    userEmail?: string;
    action: string;
    target?: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          target: data.target,
          details: data.details,
          ipAddress: data.ipAddress,
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
      return null;
    }
  }

  /**
   * Executive Dashboard Statistics untuk Super Admin
   */
  async getExecutiveStats(periodId?: string) {
    const periodFilter = periodId ? { periodId } : {};

    // 1. User Demographic
    const [totalUsers, superAdminCount, adminCount, applicantCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.SUPER_ADMIN } }),
        this.prisma.user.count({ where: { role: Role.ADMIN } }),
        this.prisma.user.count({ where: { role: Role.APPLICANT } }),
      ]);

    // 2. Applicant & Registration Metrics
    const totalApplicants = await this.prisma.applicant.count({
      where: {
        deletedAt: null,
        ...(periodId ? { registrations: { some: { periodId } } } : {}),
      },
    });

    const statusCounts = await Promise.all([
      this.prisma.registration.count({
        where: { status: RegistrationStatus.BELUM_LENGKAP, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.MENUNGGU_VERIFIKASI, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.DIVERIFIKASI, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.LULUS_SELEKSI, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.DAFTAR_ULANG, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.DITERIMA, ...periodFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.DITOLAK, ...periodFilter },
      }),
    ]);

    // 3. Financial Metrics
    const verifiedPayments = await this.prisma.payment.aggregate({
      where: {
        status: PaymentStatus.VERIFIED,
        ...(periodId ? { registration: { periodId } } : {}),
      },
      _sum: { amount: true },
      _count: true,
    });

    const pendingPayments = await this.prisma.payment.aggregate({
      where: {
        status: PaymentStatus.PENDING,
        ...(periodId ? { registration: { periodId } } : {}),
      },
      _sum: { amount: true },
      _count: true,
    });

    // 4. Study Program Quota Fulfillment
    const studyPrograms = await this.prisma.studyProgram.findMany({
      include: {
        registrations: {
          where: periodFilter,
          select: { status: true },
        },
      },
    });

    const programFulfillment = studyPrograms.map((prog) => {
      const totalRegistered = prog.registrations.length;
      const acceptedCount = prog.registrations.filter((r) =>
        ([RegistrationStatus.DITERIMA, RegistrationStatus.DAFTAR_ULANG] as RegistrationStatus[]).includes(
          r.status,
        ),
      ).length;
      const passedCount = prog.registrations.filter((r) =>
        r.status === RegistrationStatus.LULUS_SELEKSI,
      ).length;

      const percentageFilled =
        prog.quota > 0 ? Math.min(100, Math.round((acceptedCount / prog.quota) * 100)) : 0;

      const estimatedTuitionRevenue = acceptedCount * prog.tuitionFee;

      return {
        id: prog.id,
        code: prog.code,
        name: prog.name,
        quota: prog.quota,
        tuitionFee: prog.tuitionFee,
        totalRegistered,
        acceptedCount,
        passedCount,
        percentageFilled,
        estimatedTuitionRevenue,
      };
    });

    // 5. Total Estimated Tuition Revenue from all accepted students
    const totalPotentialTuition = programFulfillment.reduce(
      (sum, p) => sum + p.estimatedTuitionRevenue,
      0,
    );

    // 6. Recent Audit Logs
    const recentAuditLogs = await this.prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, role: true },
        },
      },
    });

    // 7. System Setting: Registration Status
    const regOpenSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'REGISTRATION_OPEN' },
    });
    const isRegistrationOpen = regOpenSetting ? regOpenSetting.value === 'true' : true;

    return {
      userDemographic: {
        totalUsers,
        superAdminCount,
        adminCount,
        applicantCount,
      },
      applicantMetrics: {
        totalApplicants,
        belumLengkap: statusCounts[0],
        menungguVerifikasi: statusCounts[1],
        diverifikasi: statusCounts[2],
        lulusSeleksi: statusCounts[3],
        daftarUlang: statusCounts[4],
        diterima: statusCounts[5],
        ditolak: statusCounts[6],
      },
      financialMetrics: {
        verifiedAmount: verifiedPayments._sum.amount || 0,
        verifiedCount: verifiedPayments._count,
        pendingAmount: pendingPayments._sum.amount || 0,
        pendingCount: pendingPayments._count,
        totalPotentialTuition,
      },
      programFulfillment,
      recentAuditLogs,
      isRegistrationOpen,
    };
  }

  /**
   * Manajemen Seluruh Pengguna Sistem
   */
  async getUsers(role?: Role, search?: string) {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search && search.trim() !== '') {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { applicant: { fullName: { contains: search, mode: 'insensitive' } } },
        { applicant: { phone: { contains: search, mode: 'insensitive' } } },
        { applicant: { registrationNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        applicant: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            registrationNumber: true,
            deletedAt: true,
            registrations: {
              select: {
                id: true,
                status: true,
                studyProgram: { select: { name: true, code: true } },
                period: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buat Akun Admin / Super Admin Baru
   */
  async createAdmin(
    dto: { email: string; password: string; fullName?: string; role?: Role },
    currentAdmin: { id: string; email: string },
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar dalam sistem');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const targetRole = dto.role === Role.SUPER_ADMIN ? Role.SUPER_ADMIN : Role.ADMIN;

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        password: hashedPassword,
        role: targetRole,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'CREATE_ADMIN_USER',
      target: `User: ${newUser.email} (Role: ${newUser.role})`,
      details: `Super Admin ${currentAdmin.email} membuat akun ${newUser.role} baru.`,
    });

    return {
      message: `Akun ${targetRole} berhasil dibuat`,
      user: newUser,
    };
  }

  /**
   * Ubah Role Pengguna
   */
  async updateUserRole(
    userId: string,
    newRole: Role,
    currentAdmin: { id: string; email: string },
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Mencegah menghapus / mendemote Super Admin terakhir
    if (targetUser.role === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException(
          'Tidak dapat mengubah role Super Admin terakhir. Harus ada minimal satu Super Admin.',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'UPDATE_USER_ROLE',
      target: `User: ${updatedUser.email}`,
      details: `Role diubah dari ${targetUser.role} menjadi ${newRole}`,
    });

    return {
      message: `Role pengguna ${updatedUser.email} berhasil diubah menjadi ${newRole}`,
      user: updatedUser,
    };
  }

  /**
   * Reset / Ganti Password Pengguna Langsung
   */
  async resetUserPassword(
    userId: string,
    newPass: string,
    currentAdmin: { id: string; email: string },
  ) {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Password baru minimal 6 karakter');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'RESET_USER_PASSWORD',
      target: `User: ${targetUser.email}`,
      details: `Password pengguna di-reset oleh Super Admin ${currentAdmin.email}`,
    });

    return { message: `Password untuk ${targetUser.email} berhasil diperbarui` };
  }

  /**
   * Hapus Pengguna (Admin atau Applicant)
   */
  async deleteUser(userId: string, currentAdmin: { id: string; email: string }) {
    if (userId === currentAdmin.id) {
      throw new ForbiddenException('Anda tidak dapat menghapus akun Anda sendiri');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    if (targetUser.role === Role.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.user.count({
        where: { role: Role.SUPER_ADMIN },
      });
      if (superAdminCount <= 1) {
        throw new ForbiddenException(
          'Tidak dapat menghapus Super Admin terakhir pada sistem.',
        );
      }
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'DELETE_USER',
      target: `User: ${targetUser.email} (${targetUser.role})`,
      details: `Akun dihapus permanen oleh Super Admin ${currentAdmin.email}`,
    });

    return { message: `Pengguna ${targetUser.email} berhasil dihapus permanen` };
  }

  /**
   * Audit Logs
   */
  async getAuditLogs(action?: string, limit = 100) {
    const where: any = {};
    if (action && action.trim() !== '') {
      where.action = { contains: action, mode: 'insensitive' };
    }

    return this.prisma.auditLog.findMany({
      where,
      take: Math.min(limit, 200),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * Kelola Pengaturan Global Sistem PMB
   */
  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return {
      list: settings,
      map: settingsMap,
    };
  }

  /**
   * Update Pengaturan Global
   */
  async updateSettings(
    payload: Record<string, string>,
    currentAdmin: { id: string; email: string },
  ) {
    const updatedKeys: string[] = [];

    for (const [key, value] of Object.entries(payload)) {
      if (typeof value === 'string') {
        await this.prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
        updatedKeys.push(key);
      }
    }

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'UPDATE_SYSTEM_SETTINGS',
      target: 'System Settings',
      details: `Diperbarui kunci: ${updatedKeys.join(', ')} oleh ${currentAdmin.email}`,
    });

    return {
      message: 'Pengaturan sistem berhasil disimpan',
      updatedKeys,
    };
  }

  /**
   * Kosongkan Keranjang Sampah Sekaligus (Purge Trash)
   */
  async purgeTrash(currentAdmin: { id: string; email: string }) {
    const trashedApplicants = await this.prisma.applicant.findMany({
      where: { deletedAt: { not: null } },
      select: { id: true, userId: true, fullName: true },
    });

    const userIds = trashedApplicants.map((a) => a.userId);

    // Hapus users (cascade akan menghapus applicant, berkas, pendaftaran)
    const result = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'PURGE_TRASH',
      target: 'Semua Sampah Pendaftar',
      details: `${result.count} data pendaftar yang berada di tong sampah dibersihkan permanen oleh Super Admin.`,
    });

    return {
      message: `Berhasil membersihkan ${result.count} data pendaftar secara permanen dari tong sampah.`,
      deletedCount: result.count,
    };
  }

  /**
   * Public settings (untuk homepage/portal calon mahasiswa)
   */
  async getPublicSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'REGISTRATION_OPEN',
            'REGISTRATION_FEE',
            'PAYMENT_BANK_NAME',
            'PAYMENT_ACCOUNT_NUMBER',
            'PAYMENT_ACCOUNT_HOLDER',
            'HELP_DESK_PHONE',
            'ANNOUNCEMENT_BANNER',
          ],
        },
      },
    });

    const result: Record<string, string> = {
      REGISTRATION_OPEN: 'true',
      REGISTRATION_FEE: '250000',
      PAYMENT_BANK_NAME: 'Bank Mandiri',
      PAYMENT_ACCOUNT_NUMBER: '137-00-1234567-8',
      PAYMENT_ACCOUNT_HOLDER: 'Yayasan Mulia Angkasa Akademi',
      HELP_DESK_PHONE: '081255401558',
      ANNOUNCEMENT_BANNER: '',
    };

    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return result;
  }
}
