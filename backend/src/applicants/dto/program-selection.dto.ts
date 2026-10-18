import { IsNotEmpty, IsString } from 'class-validator';

export class ProgramSelectionDto {
  @IsNotEmpty({ message: 'Pilihan Program Studi wajib dipilih' })
  @IsString()
  studyProgramId: string;
}
