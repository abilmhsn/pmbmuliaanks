import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {

  }

  async getDashboardStats(periodId?: string) {
    const registrationFilter = periodId ? { periodId } : {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Eksekusi seluruh 9 query database sekaligus secara PARALEL
    const [
      totalApplicants,
      newApplicants,
      pendingVerification,
      verified,
      passed,
      reRegistered,
      totalStudyPrograms,
      recentApplicants,
      lastWeekApplicants,
    ] = await Promise.all([
      this.prisma.applicant.count({
        where: periodId ? { registrations: { some: { periodId } } } : {},
      }),
      this.prisma.applicant.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...(periodId ? { registrations: { some: { periodId } } } : {}),
        },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.MENUNGGU_VERIFIKASI, ...registrationFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.DIVERIFIKASI, ...registrationFilter },
      }),
      this.prisma.registration.count({
        where: { status: RegistrationStatus.LULUS_SELEKSI, ...registrationFilter },
      }),
      this.prisma.registration.count({
        where: {
          status: { in: [RegistrationStatus.DAFTAR_ULANG, RegistrationStatus.DITERIMA] },
          ...registrationFilter,
        },
      }),
      this.prisma.studyProgram.count(),
      this.prisma.applicant.findMany({
        where: periodId ? { registrations: { some: { periodId } } } : {},
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          registrations: {
            include: { studyProgram: true },
          },
        },
      }),
      this.prisma.applicant.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
          ...(periodId ? { registrations: { some: { periodId } } } : {}),
        },
        select: { createdAt: true },
      }),
    ]);

    // Format Aktivitas Terbaru
    const recentActivity = recentApplicants.map((app) => ({
      name: app.fullName,
      program: app.registrations[0]?.studyProgram?.name || 'Aviation Program',
      date: new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: app.registrations[0]?.status || 'PENDING',
    }));

    // Format Tren 7 Hari Terakhir
    const trendDataMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      trendDataMap[dateStr] = 0;
    }

    lastWeekApplicants.forEach((app) => {
      const dateStr = new Date(app.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      if (trendDataMap[dateStr] !== undefined) {
        trendDataMap[dateStr] += 1;
      }
    });

    const trend = Object.keys(trendDataMap).map((date) => ({
      date,
      count: trendDataMap[date],
    }));

    return {
      totalApplicants,
      newApplicants,
      pendingVerification,
      verified,
      passed,
      reRegistered,
      totalStudyPrograms,
      recentActivity,
      trend,
    };
  }

  async getApplicants(search?: string, status?: RegistrationStatus, studyProgramId?: string, periodId?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { personalData: { nik: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filter berdasarkan status, prodi, atau periodId gelombang
    if (status || studyProgramId || periodId) {
      where.registrations = {
        some: {
          ...(status ? { status } : {}),
          ...(studyProgramId ? { studyProgramId } : {}),
          ...(periodId ? { periodId } : {}),
        },
      };
    }

    return this.prisma.applicant.findMany({
      where,
      include: {
        user: { select: { email: true } },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async getApplicantDetail(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, createdAt: true } },
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
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    return applicant;
  }

  // --- FUNGSI TRASH / SOFT DELETE ---
  async softDeleteApplicant(id: string, currentUser?: { id?: string; email?: string }) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const updated = await this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'TRASH_APPLICANT',
          target: `Pendaftar: ${applicant.fullName}`,
          details: `Data pendaftar dipindahkan ke tempat sampah oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return updated;
  }

  async getTrashApplicants() {
    return await this.prisma.applicant.findMany({
      where: { deletedAt: { not: null } },
      include: {
        user: { select: { email: true } },
        personalData: true,
        educationData: true,
        registrations: {
          include: {
            studyProgram: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  async restoreApplicant(id: string, currentUser?: { id?: string; email?: string }) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const updated = await this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: null },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'RESTORE_APPLICANT',
          target: `Pendaftar: ${applicant.fullName}`,
          details: `Data pendaftar dipulihkan dari tempat sampah oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return updated;
  }

  async updateRegistrationStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string,
    currentUser?: { id?: string; email?: string },
  ) {
    const reg = await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status, notes },
      include: { applicant: true },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'STATUS_UPDATE',
          target: `Pendaftar: ${reg.applicant.fullName}`,
          details: `Status pendaftaran diubah menjadi "${status}"${notes ? ` (Catatan: ${notes})` : ''} oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return reg;
  }

  async verifyDocument(
    documentId: string,
    isVerified: boolean,
    notes?: string,
    currentUser?: { id?: string; email?: string },
  ) {
    const doc = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        notes,
      },
      include: { applicant: true },
    });

    if (isVerified && doc.applicantId) {
      await this.prisma.registration.updateMany({
        where: { applicantId: doc.applicantId },
        data: { status: RegistrationStatus.DIVERIFIKASI },
      });
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'VERIFY_DOCUMENT',
          target: `Berkas: ${doc.fileName} (${doc.type}) - ${doc.applicant.fullName}`,
          details: `Dokumen diverifikasi sebagai "${isVerified ? 'VALID' : 'BELUM VALID'}"${notes ? ` (Catatan: ${notes})` : ''} oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return doc;
  }

  async verifyPayment(
    paymentId: string,
    status: PaymentStatus,
    notes?: string,
    currentUser?: { id?: string; email?: string },
  ) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        notes,
        verifiedAt: status === PaymentStatus.VERIFIED ? new Date() : null,
      },
      include: { registration: { include: { applicant: true } } },
    });

    if (status === PaymentStatus.VERIFIED && payment.registrationId) {
      await this.prisma.registration.update({
        where: { id: payment.registrationId },
        data: { status: RegistrationStatus.DIVERIFIKASI },
      });
    }

    try {
      const applicantName = payment.registration?.applicant?.fullName || 'Pendaftar';
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'VERIFY_PAYMENT',
          target: `Pembayaran Rp ${payment.amount} - ${applicantName}`,
          details: `Status pembayaran diverifikasi sebagai "${status}"${notes ? ` (Catatan: ${notes})` : ''} oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return payment;
  }

  async permanentDeleteApplicant(id: string, currentUser?: { id?: string; email?: string }) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const deleted = await this.prisma.applicant.delete({
      where: { id },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'PERMANENT_DELETE_APPLICANT',
          target: `Pendaftar: ${applicant.fullName}`,
          details: `Data pendaftar dihapus secara permanen dari sistem oleh ${currentUser?.email || 'Admin'}`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return deleted;
  }

  // --- FUNGSI EXPORT CSV DENGAN FILTER GELOMBANG ---
  async exportApplicantsToCsv(periodId?: string): Promise<string> {
    const applicants = await this.prisma.applicant.findMany({
      where: periodId ? { registrations: { some: { periodId } } } : {},
      include: {
        user: { select: { email: true } },
        personalData: true,
        educationData: true,
        registrations: {
          include: { studyProgram: true, period: true },
        },
      },
      orderBy: { createdAt: 'desc' },



    });

    let csv = '"No. Pendaftaran","Nama Lengkap","Email","No. WhatsApp","NIK","Jenis Kelamin","Tempat, Tgl Lahir","Alamat","Asal Sekolah","NPSN","Jurusan SMA/SMK","Pilihan Prodi PMB","Gelombang","Status Pendaftaran","Tanggal Daftar"\n';

    applicants.forEach((app) => {
      const reg = app.registrations[0];
      const p = app.personalData;
      const e = app.educationData;

      const regNo = app.registrationNumber || '-';
      const name = app.fullName || '-';
      const email = app.user?.email || '-';
      const phone = app.phone || '-';
      const nik = p?.nik || '-';
      const gender = p?.gender || '-';
      const ttl = p ? `${p.birthPlace}, ${new Date(p.birthDate).toLocaleDateString('id-ID')}` : '-';
      const address = p ? `${p.address}, ${p.city}, ${p.province}`.replace(/,/g, ' ') : '-';
      const school = e?.schoolName || '-';
      const npsn = e?.npsn || '-';
      const major = e?.major || '-';
      const program = reg?.studyProgram?.name || '-';
      const periodName = reg?.period?.name || '-';
      const status = reg?.status || 'BELUM_LENGKAP';
      const date = new Date(app.createdAt).toLocaleDateString('id-ID');

      csv += `"${regNo}","${name}","${email}","${phone}","${nik}","${gender}","${ttl}","${address}","${school}","${npsn}","${major}","${program}","${periodName}","${status}","${date}"\n`;
    });

    return csv;
  }
  // --- FUNGSI AMBIL LOG KERJA / AUDIT LOG ---
  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100, // Mengambil 100 riwayat aktivitas kerja terbaru
    });
  }

}