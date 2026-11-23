import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalDataDto } from './dto/personal-data.dto';
import { EducationDataDto } from './dto/education-data.dto';
import { ProgramSelectionDto } from './dto/program-selection.dto';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class ApplicantsService {
  constructor(private prisma: PrismaService) { }

  private async checkAndUpdateStatus(applicantId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        personalData: true,
        educationData: true,
        registrations: {
          orderBy: { registeredAt: 'desc' },
        },
        documents: true,
      },
    });

    if (!applicant) return;

    const hasPersonal = !!applicant.personalData;
    const hasEducation = !!applicant.educationData;
    const registration = applicant.registrations[0];

    if (hasPersonal && hasEducation && registration) {
      if (registration.status === RegistrationStatus.BELUM_LENGKAP) {
        await this.prisma.registration.update({
          where: { id: registration.id },
          data: { status: RegistrationStatus.MENUNGGU_VERIFIKASI },
        });
      }
    }
  }

  async savePersonalData(userId: string, dto: PersonalDataDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    if (dto.phone) {
      await this.prisma.applicant.update({
        where: { id: applicant.id },
        data: { phone: dto.phone },
      });
    }

    const personalData = await this.prisma.personalData.upsert({
      where: { applicantId: applicant.id },
      update: {
        nik: dto.nik,
        birthPlace: dto.birthPlace,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        address: dto.address,
        rtRw: dto.rtRw || null,
        postalCode: dto.postalCode || null,
        district: dto.district || null,
        subDistrict: dto.subDistrict || null,
        city: dto.city,
        province: dto.province,
      },
      create: {
        applicantId: applicant.id,
        nik: dto.nik,
        birthPlace: dto.birthPlace,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        address: dto.address,
        rtRw: dto.rtRw || null,
        postalCode: dto.postalCode || null,
        district: dto.district || null,
        subDistrict: dto.subDistrict || null,
        city: dto.city,
        province: dto.province,
      },
    });

    await this.checkAndUpdateStatus(applicant.id);
    return { message: 'Data pribadi berhasil disimpan', personalData };
  }

  async saveEducationData(userId: string, dto: EducationDataDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const educationData = await this.prisma.educationData.upsert({
      where: { applicantId: applicant.id },
      update: {
        schoolName: dto.schoolName,
        npsn: dto.npsn,
        major: dto.major,
        graduationYear: dto.graduationYear,
      },
      create: {
        applicantId: applicant.id,
        schoolName: dto.schoolName,
        npsn: dto.npsn,
        major: dto.major,
        graduationYear: dto.graduationYear,
      },
    });

    await this.checkAndUpdateStatus(applicant.id);
    return { message: 'Data pendidikan berhasil disimpan', educationData };
  }

  async saveStudyProgramSelection(userId: string, dto: ProgramSelectionDto) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    // Ambil gelombang aktif yang diatur admin dari database (tanpa hardcode tahun/tanggal)
    const activePeriod = await this.prisma.pmbPeriod.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!activePeriod) {
      throw new BadRequestException(
        'Saat ini belum ada gelombang pendaftaran PMB yang dibuka. Silakan hubungi panitia PMB.',
      );
    }

    // Validasi rentang tanggal gelombang aktif (toleransi sampai akhir hari endDate)
    const now = new Date();
    const startDate = new Date(activePeriod.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(activePeriod.endDate);
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate) {
      throw new BadRequestException(
        `Pendaftaran ${activePeriod.name} (${activePeriod.year}) baru dibuka pada ${startDate.toLocaleDateString('id-ID')}.`,
      );
    }

    if (now > endDate) {
      throw new BadRequestException(
        `Masa pendaftaran ${activePeriod.name} (${activePeriod.year}) telah berakhir pada ${endDate.toLocaleDateString('id-ID')}.`,
      );
    }

    const targetProgram = await this.prisma.studyProgram.findUnique({
      where: { id: dto.studyProgramId },
    });

    if (!targetProgram) {
      throw new NotFoundException('Program studi tidak ditemukan');
    }

    // Cek pendaftaran pada periode aktif saja agar arsip tahun sebelumnya tetap utuh
    const existingRegInActivePeriod = await this.prisma.registration.findFirst({
      where: {
        applicantId: applicant.id,
        periodId: activePeriod.id,
      },
    });

    const registration = await this.prisma.$transaction(
      async (tx) => {
        // Jika mengganti pilihan prodi pada periode aktif, kembalikan kuota prodi lama
        if (
          existingRegInActivePeriod &&
          existingRegInActivePeriod.studyProgramId &&
          existingRegInActivePeriod.studyProgramId !== dto.studyProgramId
        ) {
          await tx.studyProgram.update({
            where: { id: existingRegInActivePeriod.studyProgramId },
            data: { quota: { increment: 1 } },
          });
        }

        // Jika pilihan baru, pastikan kuota masih tersedia (atomic check-and-decrement)
        if (
          !existingRegInActivePeriod ||
          existingRegInActivePeriod.studyProgramId !== dto.studyProgramId
        ) {
          // Re-read di dalam tx untuk mencegah race condition
          const programInTx = await tx.studyProgram.findUnique({
            where: { id: dto.studyProgramId },
            select: { quota: true, name: true },
          });

          if (!programInTx || programInTx.quota <= 0) {
            throw new BadRequestException(
              `Mohon maaf, kuota untuk Program Studi ${programInTx?.name ?? dto.studyProgramId} sudah penuh.`,
            );
          }

          // Atomic decrement — hanya berhasil jika quota > 0 saat update berlangsung
          const updated = await tx.studyProgram.updateMany({
            where: { id: dto.studyProgramId, quota: { gt: 0 } },
            data: { quota: { decrement: 1 } },
          });

          if (updated.count === 0) {
            throw new BadRequestException(
              `Mohon maaf, kuota Program Studi sudah penuh (sesi bersamaan terdeteksi).`,
            );
          }
        }

        if (existingRegInActivePeriod) {
          return tx.registration.update({
            where: { id: existingRegInActivePeriod.id },
            data: {
              studyProgramId: dto.studyProgramId,
              periodId: activePeriod.id,
            },
            include: { studyProgram: true, period: true },
          });
        }

        return tx.registration.create({
          data: {
            applicantId: applicant.id,
            studyProgramId: dto.studyProgramId,
            periodId: activePeriod.id,
            status: RegistrationStatus.BELUM_LENGKAP,
          },
          include: { studyProgram: true, period: true },
        });
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    await this.checkAndUpdateStatus(applicant.id);
    return { message: 'Pilihan Program Studi berhasil disimpan', registration };
  }

  async getMyData(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        personalData: true,
        educationData: true,
        registrations: {
          orderBy: { registeredAt: 'desc' },
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

  async getRegistrationSlip(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        personalData: true,
        educationData: true,
        registrations: {
          orderBy: { registeredAt: 'desc' },
          include: {
            studyProgram: true,
            period: true,
          },
        },
        documents: true,
      },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const registration = applicant.registrations[0];
    if (!registration) {
      throw new BadRequestException('Belum ada pendaftaran aktif');
    }

    const fullAddress =
      [
        applicant.personalData?.address,
        applicant.personalData?.rtRw ? `RT/RW ${applicant.personalData.rtRw}` : null,
        applicant.personalData?.subDistrict ? `Kel. ${applicant.personalData.subDistrict}` : null,
        applicant.personalData?.district ? `Kec. ${applicant.personalData.district}` : null,
        applicant.personalData?.city,
        applicant.personalData?.province,
        applicant.personalData?.postalCode,
      ]
        .filter(Boolean)
        .join(', ') || '-';

    return {
      campusName: 'KAMPUS MULIA ANGKASA',
      campusAddress: 'Jl. Kesambi No. 92, Kel. Kesambi, Kec. Kesambi, Kota Cirebon, Jawa Barat',
      registrationNumber: applicant.registrationNumber,
      registeredAt: registration.registeredAt,
      applicantName: applicant.fullName,
      email: applicant.user?.email || '-',
      phone: applicant.phone,
      nik: applicant.personalData?.nik || '-',
      gender: applicant.personalData?.gender || '-',
      birthInfo: `${applicant.personalData?.birthPlace || '-'}, ${applicant.personalData?.birthDate
          ? new Date(applicant.personalData.birthDate).toLocaleDateString('id-ID')
          : '-'
        }`,
      address: fullAddress,
      schoolName: applicant.educationData?.schoolName || '-',
      npsn: applicant.educationData?.npsn || '-',
      major: applicant.educationData?.major || '-',
      studyProgramName: registration.studyProgram.name,
      studyProgramCode: registration.studyProgram.code,
      periodName: registration.period.name,
      periodYear: registration.period.year,
      status: registration.status,
    };
  }

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
            period: true,
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
}