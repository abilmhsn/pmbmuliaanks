import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul berita wajib diisi' })
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty({ message: 'Isi konten berita wajib diisi' })
  content: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(NewsStatus, { message: 'Status berita harus DRAFT atau PUBLISHED' })
  @IsOptional()
  status?: NewsStatus;

  @IsOptional()
  publishedAt?: string | Date;
}
