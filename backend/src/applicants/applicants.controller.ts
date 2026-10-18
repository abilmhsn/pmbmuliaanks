import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { PersonalDataDto } from './dto/personal-data.dto';
import { EducationDataDto } from './dto/education-data.dto';
import { ProgramSelectionDto } from './dto/program-selection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get('my-data')
  async getMyData(@CurrentUser('id') userId: string) {
    return this.applicantsService.getMyData(userId);
  }

  @Post('personal-data')
  async savePersonalData(
    @CurrentUser('id') userId: string,
    @Body() dto: PersonalDataDto,
  ) {
    return this.applicantsService.savePersonalData(userId, dto);
  }

  @Post('education-data')
  async saveEducationData(
    @CurrentUser('id') userId: string,
    @Body() dto: EducationDataDto,
  ) {
    return this.applicantsService.saveEducationData(userId, dto);
  }

  @Post('program-selection')
  async saveProgramSelection(
    @CurrentUser('id') userId: string,
    @Body() dto: ProgramSelectionDto,
  ) {
    return this.applicantsService.saveStudyProgramSelection(userId, dto);
  }

  @Get('print-slip')
  async getRegistrationSlip(@CurrentUser('id') userId: string) {
    return this.applicantsService.getRegistrationSlip(userId);
  }
}
