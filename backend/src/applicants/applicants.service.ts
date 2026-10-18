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
        registrations: true,
        documents: true,
      },
    });


    if (!applicant) return;

    // Check if personal, education, study program are provided
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

    const personalData = await this.prisma.personalData.upsert({
      where: { applicantId: applicant.id },
      update: {
        nik: dto.nik,
        birthPlace: dto.birthPlace,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        address: dto.address,
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

    // Get active PMB period
    let activePeriod = await this.prisma.pmbPeriod.findFirst({
      where: { isActive: true },
    });

    if (!activePeriod) {
      // Fallback: create standard period if none active
      activePeriod = await this.prisma.pmbPeriod.create({
        data: {
          year: '2026/2027',
          name: 'PMB Gelombang I 2026/2027',
          startDate: new Date(),
          endDate: new Date('2026-12-31'),
          isActive: true,
        },
      });
    }

    const existingReg = await this.prisma.registration.findFirst({
      where: { applicantId: applicant.id },
    });

    let registration;
    if (existingReg) {
      registration = await this.prisma.registration.update({
        where: { id: existingReg.id },
        data: {
          studyProgramId: dto.studyProgramId,
          periodId: activePeriod.id,
        },
        include: { studyProgram: true, period: true },
      });
    } else {
      registration = await this.prisma.registration.create({
        data: {
          applicantId: applicant.id,
          studyProgramId: dto.studyProgramId,
          periodId: activePeriod.id,
          status: RegistrationStatus.BELUM_LENGKAP,
        },
        include: { studyProgram: true, period: true },
      });
    }

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
        personalData: true,
        educationData: true,
        registrations: {
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

    return {
      campusName: 'KAMPUS MULIA ANGKASA',
      campusAddress: 'Jl. Penerbangan No. 88, Ksatria Bandara, Indonesia',
      registrationNumber: applicant.registrationNumber,
      registeredAt: registration.registeredAt,
      applicantName: applicant.fullName,
      email: applicant.phone, // phone stored in applicant
      phone: applicant.phone,
      nik: applicant.personalData?.nik || '-',
      gender: applicant.personalData?.gender || '-',
      birthInfo: `${applicant.personalData?.birthPlace || '-'}, ${applicant.personalData?.birthDate ? new Date(applicant.personalData.birthDate).toLocaleDateString('id-ID') : '-'}`,
      address: `${applicant.personalData?.address || '-'}, ${applicant.personalData?.city || '-'}, ${applicant.personalData?.province || '-'}`,
      schoolName: applicant.educationData?.schoolName || '-',
      npsn: applicant.educationData?.npsn || '-',
      major: applicant.educationData?.major || '-',
      studyProgramName: registration.studyProgram.name,
      studyProgramCode: registration.studyProgram.code,
      periodName: registration.period.name,
      status: registration.status,
    };
  }

  // 1. Memindahkan pendaftar ke Trash (Soft Delete)
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

  // 2. Mengambil daftar pendaftar yang berada di Trash
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

  // 3. Memulihkan data dari Trash (Restore)
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

