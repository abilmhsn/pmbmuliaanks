import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '@prisma/client';

export class UpdateNewsDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(NewsStatus, { message: 'Status berita harus DRAFT atau PUBLISHED' })
  @IsOptional()
  status?: NewsStatus;

  @IsOptional()
  publishedAt?: string | Date;
}
