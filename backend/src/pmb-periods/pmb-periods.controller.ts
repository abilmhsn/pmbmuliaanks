import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { PmbPeriodsService } from './pmb-periods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pmb-periods')
export class PmbPeriodsController {
  constructor(private readonly pmbPeriodsService: PmbPeriodsService) { }

  @Get()
  async getAllPeriods() {
    return this.pmbPeriodsService.getAll();
  }

  @Get('active')
  async getActive() {
    return this.pmbPeriodsService.getActive();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  async getAll() {
    return this.pmbPeriodsService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() data: any) {
    return this.pmbPeriodsService.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.pmbPeriodsService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/activate')
  async activate(@Param('id') id: string) {
    return this.pmbPeriodsService.update(id, { isActive: true });
  }
}

