import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    userId: string,
    type: DocumentType,
    file: Express.Multer.File,
  ) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    const fileUrl = `/uploads/documents/${file.filename}`;

    const existingDoc = await this.prisma.document.findFirst({
      where: {
        applicantId: applicant.id,
        type,
      },
    });

    if (existingDoc) {
      return this.prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          fileUrl,
          fileName: file.originalname,
          isVerified: false,
        },
      });
    }

    return this.prisma.document.create({
      data: {
        applicantId: applicant.id,
        type,
        fileUrl,
        fileName: file.originalname,
      },
    });
  }

  async getMyDocuments(userId: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      throw new NotFoundException('Data pendaftar tidak ditemukan');
    }

    return this.prisma.document.findMany({
      where: { applicantId: applicant.id },
    });
  }
}
