import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class EducationDataDto {
  @IsNotEmpty({ message: 'Nama asal sekolah wajib diisi' })
  @IsString()
  schoolName: string;

  @IsNotEmpty({ message: 'NPSN wajib diisi' })
  @IsString()
  npsn: string;

  @IsNotEmpty({ message: 'Jurusan wajib diisi' })
  @IsString()
  major: string;

  @IsNotEmpty({ message: 'Tahun lulus wajib diisi' })
  @Type(() => Number)
  @IsInt()
  @Min(1990)
  graduationYear: number;
}
