import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class PersonalDataDto {
  @IsNotEmpty()
  @IsString()
  @Length(16, 16, { message: 'NIK harus tepat 16 digit' })
  nik: string;

  @IsNotEmpty()
  @IsString()
  birthPlace: string;

  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsOptional() // 👈 Tambahkan ini agar opsional / bisa disimpan
  @IsString()
  phone?: string;  // 👈 Tambahkan ini

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  province: string;
}