import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Role, RegistrationStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class SuperAdminService {
  private statsCache = new Map<string, { data: any; expiry: number }>();

  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) { }

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
    const cacheKey = periodId || 'all';
    const cached = this.statsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const periodFilter = periodId ? { periodId } : {};

    // Optimasi: Gabungkan query secara paralel dan manfaatkan groupBy untuk mereduksi round-trip database
    const [
      userRoleGroups,
      totalApplicants,
      statusGroups,
      verifiedPayments,
      pendingPayments,
      paymentList,
      studyPrograms,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      this.prisma.applicant.count({
        where: {
          deletedAt: null,
          registrations: {
            some: periodId ? { periodId } : {},
          },
        },
      }),
      this.prisma.registration.groupBy({
        by: ['status'],
        where: periodFilter,
        _count: { _all: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.VERIFIED,
          ...(periodId ? { registration: { periodId } } : {}),
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: {
          status: PaymentStatus.PENDING,
          ...(periodId ? { registration: { periodId } } : {}),
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.payment.findMany({
        where: {
          status: { in: [PaymentStatus.VERIFIED, PaymentStatus.PENDING] },
          ...(periodId ? { registration: { periodId } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          paymentType: true,
          proofUrl: true,
          status: true,
          notes: true,
          verifiedAt: true,
          createdAt: true,
          registration: {
            select: {
              applicant: {
                select: {
                  fullName: true,
                  registrationNumber: true,
                  phone: true,
                },
              },
              studyProgram: {
                select: {
                  code: true,
                  name: true,
                },
              },
              period: {
                select: {
                  year: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.studyProgram.findMany({
        where: { isActive: true },
        include: {
          registrations: {
            where: {
              ...periodFilter,
              applicant: { deletedAt: null },
            },
            select: { status: true },
          },
        },
        orderBy: { code: 'asc' },
      }),
      this.prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      }),
    ]);

    let totalUsers = 0;
    let superAdminCount = 0;
    let adminCount = 0;
    let applicantCount = 0;
    for (const group of userRoleGroups) {
      const count = group._count._all;
      totalUsers += count;
      if (group.role === Role.SUPER_ADMIN) superAdminCount = count;
      if (group.role === Role.ADMIN) adminCount = count;
      if (group.role === Role.APPLICANT) applicantCount = count;
    }

    const statusMap: Record<string, number> = {};
    for (const s of statusGroups) {
      statusMap[s.status] = s._count._all;
    }

    const programFulfillment = studyPrograms.map((prog) => {
      const totalRegistered = prog.registrations.length;
      const acceptedCount = prog.registrations.filter((r) =>
        ([RegistrationStatus.DITERIMA, RegistrationStatus.DAFTAR_ULANG] as RegistrationStatus[]).includes(
          r.status,
        ),
      ).length;
      const passedCount = prog.registrations.filter((r) =>
        ([RegistrationStatus.LULUS_SELEKSI, RegistrationStatus.DITERIMA, RegistrationStatus.DAFTAR_ULANG] as RegistrationStatus[]).includes(
          r.status,
        ),
      ).length;

      // Keterisian kuota program studi dihitung dari pendaftar/peminat yang memilih jurusan tersebut
      const percentageFilled =
        prog.quota > 0 ? Math.min(100, Math.round((totalRegistered / prog.quota) * 100)) : 0;
      const remainingQuota = Math.max(0, (prog.quota || 0) - totalRegistered);

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
        remainingQuota,
      };
    });

    const isRegistrationOpen = true;

    const result = {
      userDemographic: {
        totalUsers,
        superAdminCount,
        adminCount,
        applicantCount,
      },
      applicantMetrics: {
        totalApplicants,
        belumLengkap: statusMap[RegistrationStatus.BELUM_LENGKAP] || 0,
        menungguVerifikasi: statusMap[RegistrationStatus.MENUNGGU_VERIFIKASI] || 0,
        diverifikasi: statusMap[RegistrationStatus.DIVERIFIKASI] || 0,
        lulusSeleksi: statusMap[RegistrationStatus.LULUS_SELEKSI] || 0,
        daftarUlang: statusMap[RegistrationStatus.DAFTAR_ULANG] || 0,
        diterima: statusMap[RegistrationStatus.DITERIMA] || 0,
        ditolak: statusMap[RegistrationStatus.DITOLAK] || 0,
      },
      financialMetrics: {
        verifiedAmount: verifiedPayments._sum.amount || 0,
        verifiedCount: verifiedPayments._count,
        pendingAmount: pendingPayments._sum.amount || 0,
        pendingCount: pendingPayments._count,
        transactions: paymentList,
      },
      programFulfillment,
      recentAuditLogs,
      isRegistrationOpen,
    };

    // Cache hasil selama 5 detik untuk respon instan di dashboard saat ada yang memilih jurusan
    this.statsCache.set(cacheKey, { data: result, expiry: Date.now() + 5000 });

    return result;
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
   * Buat Akun Admin / Super Admin Baru via Supabase Auth
   */
  async createAdmin(
    dto: { email: string; password: string; fullName?: string; role?: Role },
    currentAdmin: { id: string; email: string },
  ) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new BadRequestException('Email sudah terdaftar dalam sistem PMB');
    }

    const targetRole = dto.role === Role.SUPER_ADMIN ? Role.SUPER_ADMIN : Role.ADMIN;

    // 1. Buat akun di Supabase Auth (Password dikelola oleh Supabase Auth)
    let sbUser: any;
    try {
      sbUser = await this.supabaseService.adminCreateUser({
        email: cleanEmail,
        password: dto.password,
        user_metadata: {
          fullName: dto.fullName || cleanEmail,
          role: targetRole,
        },
      });
    } catch (err: any) {
      throw new BadRequestException(`Gagal membuat akun di Supabase Auth: ${err?.message || err}`);
    }

    // 2. Simpan identitas pengguna ke Prisma User dengan ID yang sama persis
    const newUser = await this.prisma.user.create({
      data: {
        id: sbUser.id,
        email: cleanEmail,
        role: targetRole,
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'CREATE_ADMIN_USER',
      target: `User: ${newUser.email} (Role: ${newUser.role})`,
      details: `Super Admin ${currentAdmin.email} membuat akun ${newUser.role} baru via Supabase Auth.`,
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
   * Reset / Ganti Password Pengguna Langsung via Supabase Auth
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

    try {
      await this.supabaseService.adminUpdateUser(userId, { password: newPass });
    } catch (err: any) {
      throw new BadRequestException(`Gagal memperbarui password di Supabase Auth: ${err?.message || err}`);
    }

    await this.logAction({
      userId: currentAdmin.id,
      userEmail: currentAdmin.email,
      action: 'RESET_USER_PASSWORD',
      target: `User: ${targetUser.email}`,
      details: `Password pengguna di-reset oleh Super Admin ${currentAdmin.email} via Supabase Auth`,
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

    // Hapus dari Supabase Auth
    await this.supabaseService.adminDeleteUser(userId).catch(() => { });

    // Hapus dari Prisma
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
   * Kelola Pengaturan Global Sistem PMB (Untuk Admin Dashboard)
   */
  async getSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    settingsMap.REGISTRATION_OPEN = 'true';

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
    if (payload.REGISTRATION_FEE && Number(payload.REGISTRATION_FEE) > 3500000) {
      throw new BadRequestException('Nominal uang muka pendaftaran maksimal Rp 3.500.000');
    }

    const normalizedPayload: Record<string, string> = {
      ...payload,
      REGISTRATION_OPEN: 'true',
    };
    const updatedKeys: string[] = [];

    for (const [key, value] of Object.entries(normalizedPayload)) {
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

    // Hapus juga akun autentikasi di Supabase Auth agar email bisa didaftarkan ulang jika diperlukan
    await Promise.allSettled(
      userIds.map((uid) => this.supabaseService.adminDeleteUser(uid).catch(() => { })),
    );

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
   * Public settings (untuk portal calon mahasiswa)
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

    // Transformasi Array dari Prisma menjadi Object Key-Value
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    settingsMap.REGISTRATION_OPEN = 'true';

    return settingsMap;
  }
}