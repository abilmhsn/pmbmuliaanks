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

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  rtRw?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  subDistrict?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  province: string;
}