import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class PersonalDataDto {
  @IsNotEmpty({ message: 'NIK wajib diisi' })
  @IsString()
  nik: string;

  @IsNotEmpty({ message: 'Tempat lahir wajib diisi' })
  @IsString()
  birthPlace: string;

  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi' })
  @IsDateString({}, { message: 'Format tanggal lahir tidak valid' })
  birthDate: string;

  @IsNotEmpty({ message: 'Jenis kelamin wajib diisi' })
  @IsString()
  gender: string;

  @IsNotEmpty({ message: 'Alamat lengkap wajib diisi' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'Kota/Kabupaten wajib diisi' })
  @IsString()
  city: string;

  @IsNotEmpty({ message: 'Provinsi wajib diisi' })
  @IsString()
  province: string;
}
