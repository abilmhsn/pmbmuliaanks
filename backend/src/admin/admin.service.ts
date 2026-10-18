import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats() {
    const totalApplicants = await this.prisma.applicant.count();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newApplicants = await this.prisma.applicant.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const pendingVerification = await this.prisma.registration.count({
      where: { status: RegistrationStatus.MENUNGGU_VERIFIKASI },
    });

    const verified = await this.prisma.registration.count({
      where: { status: RegistrationStatus.DIVERIFIKASI },
    });

    const passed = await this.prisma.registration.count({
      where: { status: RegistrationStatus.LULUS_SELEKSI },
    });

    const reRegistered = await this.prisma.registration.count({
      where: {
        status: { in: [RegistrationStatus.DAFTAR_ULANG, RegistrationStatus.DITERIMA] },
      },
    });

    const totalStudyPrograms = await this.prisma.studyProgram.count();

    return {
      totalApplicants,
      newApplicants,
      pendingVerification,
      verified,
      passed,
      reRegistered,
      totalStudyPrograms,
    };
  }

  async getApplicants(search?: string, status?: RegistrationStatus, studyProgramId?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { personalData: { nik: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status || studyProgramId) {
      where.registrations = {
        some: {
          ...(status ? { status } : {}),
          ...(studyProgramId ? { studyProgramId } : {}),
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
  async softDeleteApplicant(id: string) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    return await this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
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

  async restoreApplicant(id: string) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    return await this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async updateRegistrationStatus(registrationId: string, status: RegistrationStatus, notes?: string) {
    return this.prisma.registration.update({
      where: { id: registrationId },
      data: { status, notes },
    });
  }

  // --- BAGIAN INI YANG DIPERBARUI ---
  async verifyDocument(documentId: string, isVerified: boolean, notes?: string) {
    const doc = await this.prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
        notes,
      },
      include: { applicant: true },
    });

    // Otomatis ubah status pendaftaran ke DIVERIFIKASI jika dokumen disetujui
    if (isVerified && doc.applicantId) {
      await this.prisma.registration.updateMany({
        where: { applicantId: doc.applicantId },
        data: { status: RegistrationStatus.DIVERIFIKASI },
      });
    }

    return doc;
  }

  async verifyPayment(paymentId: string, status: PaymentStatus, notes?: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        notes,
        verifiedAt: status === PaymentStatus.VERIFIED ? new Date() : null,
      },
      include: { registration: true },
    });

    // Otomatis ubah status pendaftaran ke DIVERIFIKASI jika pembayaran VERIFIED
    if (status === PaymentStatus.VERIFIED && payment.registrationId) {
      await this.prisma.registration.update({
        where: { id: payment.registrationId },
        data: { status: RegistrationStatus.DIVERIFIKASI },
      });
    }

    return payment;
  }

  // Hapus data secara permanen dari database (Hard Delete)
  async permanentDeleteApplicant(id: string) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    return await this.prisma.applicant.delete({
      where: { id },
    });
  }

  // FUNGSI EXPORT CSV YANG BARU (Ganti dari ExcelJS)
  async exportApplicantsToCsv(): Promise<string> {
    const applicants = await this.prisma.applicant.findMany({
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

    let csv = '"No. Pendaftaran","Nama Lengkap","Email","No. WhatsApp","NIK","Jenis Kelamin","Tempat, Tgl Lahir","Alamat","Asal Sekolah","NPSN","Jurusan SMA/SMK","Pilihan Prodi PMB","Status Pendaftaran","Tanggal Daftar"\n';

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
      const status = reg?.status || 'BELUM_LENGKAP';
      const date = new Date(app.createdAt).toLocaleDateString('id-ID');

      csv += `"${regNo}","${name}","${email}","${phone}","${nik}","${gender}","${ttl}","${address}","${school}","${npsn}","${major}","${program}","${status}","${date}"\n`;
    });

    return csv;
  }
}
