import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats(periodId?: string) {
    const registrationFilter = periodId ? { periodId } : {};

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Hanya hitung pendaftar yang AKTIF (deletedAt: null)
    const activeApplicantWhere = {
      deletedAt: null,
      ...(periodId ? { registrations: { some: { periodId } } } : {}),
    };

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
        where: activeApplicantWhere,
      }),
      this.prisma.applicant.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          deletedAt: null,
          ...(periodId ? { registrations: { some: { periodId } } } : {}),
        },
      }),
      this.prisma.registration.count({
        where: {
          status: RegistrationStatus.MENUNGGU_VERIFIKASI,
          applicant: { deletedAt: null },
          ...registrationFilter,
        },
      }),
      this.prisma.registration.count({
        where: {
          status: RegistrationStatus.DIVERIFIKASI,
          applicant: { deletedAt: null },
          ...registrationFilter,
        },
      }),
      this.prisma.registration.count({
        where: {
          status: RegistrationStatus.LULUS_SELEKSI,
          applicant: { deletedAt: null },
          ...registrationFilter,
        },
      }),
      this.prisma.registration.count({
        where: {
          status: { in: [RegistrationStatus.DAFTAR_ULANG, RegistrationStatus.DITERIMA] },
          applicant: { deletedAt: null },
          ...registrationFilter,
        },
      }),
      this.prisma.studyProgram.count(),
      this.prisma.applicant.findMany({
        where: activeApplicantWhere,
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
          deletedAt: null,
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
    // Selalu filter pendaftar yang TIDAK DIHAPUS (deletedAt: null)
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { personalData: { nik: { contains: search, mode: 'insensitive' } } },
      ];
    }

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
          details: `Dipindahkan ke tempat sampah`,
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
          details: `Data dipulihkan dari tempat sampah`,
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

    const statusMap: Record<string, string> = {
      BELUM_LENGKAP: 'Belum Lengkap',
      MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
      DIVERIFIKASI: 'Diverifikasi',
      LULUS_SELEKSI: 'Lulus Seleksi',
      DAFTAR_ULANG: 'Daftar Ulang',
      DITERIMA: 'Diterima Resmi',
      DITOLAK: 'Ditolak / Tidak Lulus',
    };

    const friendlyStatus = statusMap[status] || status;

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'STATUS_UPDATE',
          target: `Pendaftar: ${reg.applicant.fullName}`,
          details: `Status diubah ke "${friendlyStatus}"${notes ? ` (${notes})` : ''}`,
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
          target: `Berkas: ${doc.type} (${doc.applicant.fullName})`,
          details: `Berkas diverifikasi: ${isVerified ? 'VALID' : 'TIDAK VALID'}${notes ? ` (${notes})` : ''}`,
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

    const payStatusMap: Record<string, string> = {
      VERIFIED: 'Lunas / Sah',
      REJECTED: 'Ditolak',
      PENDING: 'Menunggu Konfirmasi',
    };

    try {
      const applicantName = payment.registration?.applicant?.fullName || 'Pendaftar';
      await this.prisma.auditLog.create({
        data: {
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          action: 'VERIFY_PAYMENT',
          target: `Pembayaran (${applicantName})`,
          details: `Status pembayaran: ${payStatusMap[status] || status}${notes ? ` (${notes})` : ''}`,
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
          details: `Data dihapus permanen`,
        },
      });
    } catch (e) {
      console.error(e);
    }

    return deleted;
  }

  async exportApplicantsToCsv(periodId?: string): Promise<string> {
    const SUPABASE_STORAGE_PUBLIC_URL =
      'https://apuvscjcdkpoevuacnzm.supabase.co/storage/v1/object/public/pmb-documents';

    const formatUrl = (path?: string) => {
      if (!path || path === '-' || path.trim() === '') return '-';
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${SUPABASE_STORAGE_PUBLIC_URL}/${path.replace(/^\//, '')}`;
    };

    const applicants = await this.prisma.applicant.findMany({
      where: {
        deletedAt: null,
        ...(periodId ? { registrations: { some: { periodId } } } : {}),
      },
      include: {
        user: { select: { email: true } },
        personalData: true,
        educationData: true,
        documents: true,
        registrations: {
          include: {
            studyProgram: true,
            period: true,
            payments: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let csv =
      '"No. Pendaftaran","Nama Lengkap","Email","No. WhatsApp","NIK","Jenis Kelamin","Tempat, Tgl Lahir","Alamat","Asal Sekolah","NPSN","Jurusan SMA/SMK","Pilihan Prodi PMB","Gelombang","Status Pendaftaran","Status Pembayaran","Nominal Bayar","URL Bukti Pembayaran","URL Pasfoto","URL KTP","URL Ijazah","URL Transkrip","Tanggal Daftar"\n';

    applicants.forEach((app) => {
      const reg = app.registrations[0];
      const p = app.personalData;
      const e = app.educationData;
      const docs = app.documents || [];
      const latestPayment = reg?.payments?.[0];

      const regNo = app.registrationNumber || '-';
      const name = app.fullName || '-';
      const email = app.user?.email || '-';
      const phone = app.phone || '-';
      const nik = p?.nik || '-';
      const gender = p?.gender || '-';
      const ttl = p
        ? `${p.birthPlace}, ${new Date(p.birthDate).toLocaleDateString('id-ID')}`
        : '-';
      const address = p
        ? `${p.address}, ${p.city}, ${p.province}`.replace(/,/g, ' ')
        : '-';
      const school = e?.schoolName || '-';
      const npsn = e?.npsn || '-';
      const major = e?.major || '-';
      const program = reg?.studyProgram?.name || '-';
      const periodName = reg?.period?.name || '-';
      const status = reg?.status || 'BELUM_LENGKAP';

      const paymentStatus = latestPayment?.status || 'BELUM_BAYAR';
      const paymentAmount = latestPayment?.amount
        ? `Rp ${latestPayment.amount.toLocaleString('id-ID')}`
        : '0';

      const proofUrl = formatUrl(latestPayment?.proofUrl);
      const fotoUrl = formatUrl(docs.find((d) => d.type === 'FOTO')?.fileUrl);
      const ktpUrl = formatUrl(docs.find((d) => d.type === 'KTP')?.fileUrl);
      const ijazahUrl = formatUrl(docs.find((d) => d.type === 'IJAZAH')?.fileUrl);
      const transkripUrl = formatUrl(docs.find((d) => d.type === 'TRANSKRIP')?.fileUrl);

      const date = new Date(app.createdAt).toLocaleDateString('id-ID');

      csv += `"${regNo}","${name}","${email}","${phone}","${nik}","${gender}","${ttl}","${address}","${school}","${npsn}","${major}","${program}","${periodName}","${status}","${paymentStatus}","${paymentAmount}","${proofUrl}","${fotoUrl}","${ktpUrl}","${ijazahUrl}","${transkripUrl}","${date}"\n`;
    });

    return csv;
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}