import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { StudyProgramsService } from './study-programs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('study-programs')
export class StudyProgramsController {
  constructor(private readonly studyProgramsService: StudyProgramsService) {}

  @Get()
  async getPublicPrograms() {
    return this.studyProgramsService.findAllActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  async getAllPrograms() {
    return this.studyProgramsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async createProgram(@Body() data: any) {
    return this.studyProgramsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  async updateProgram(@Param('id') id: string, @Body() data: any) {
    return this.studyProgramsService.update(id, data);
  }
}
