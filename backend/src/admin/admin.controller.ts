import {
  Controller,
  Get,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, RegistrationStatus, PaymentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('stats')
  async getDashboardStats(@Query('periodId') periodId?: string) {
    return this.adminService.getDashboardStats(periodId);
  }

  @Get('applicants')
  async getApplicants(
    @Query('search') search?: string,
    @Query('status') status?: RegistrationStatus,
    @Query('studyProgramId') studyProgramId?: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.adminService.getApplicants(search, status, studyProgramId, periodId);
  }

  // ENDPOINT GET TRASH (harus di atas /:id agar tidak di-intercept)
  @Get('applicants/trash')
  async getTrashApplicants() {
    return this.adminService.getTrashApplicants();
  }

  @Get('applicants/:id')
  async getApplicantDetail(@Param('id') id: string) {
    return this.adminService.getApplicantDetail(id);
  }

  // ENDPOINT SOFT DELETE (Masuk ke Trash)
  @Delete('applicants/:id')
  async softDeleteApplicant(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.adminService.softDeleteApplicant(id, user);
  }

  // ENDPOINT RESTORE (Pulihkan dari Trash)
  @Put('applicants/:id/restore')
  async restoreApplicant(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.adminService.restoreApplicant(id, user);
  }

  // ENDPOINT HAPUS PERMANEN
  @Delete('applicants/:id/permanent')
  async permanentDeleteApplicant(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.adminService.permanentDeleteApplicant(id, user);
  }

  @Put('registration-status/:id')
  async updateRegistrationStatus(
    @Param('id') registrationId: string,
    @Body() body: { status: RegistrationStatus; notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.adminService.updateRegistrationStatus(
      registrationId,
      body.status,
      body.notes,
      user,
    );
  }

  @Put('verify-document/:id')
  async verifyDocument(
    @Param('id') documentId: string,
    @Body() body: { isVerified: boolean; notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.adminService.verifyDocument(
      documentId,
      body.isVerified,
      body.notes,
      user,
    );
  }

  @Put('verify-payment/:id')
  async verifyPayment(
    @Param('id') paymentId: string,
    @Body() body: { status: PaymentStatus; notes?: string },
    @CurrentUser() user: any,
  ) {
    return this.adminService.verifyPayment(
      paymentId,
      body.status,
      body.notes,
      user,
    );
  }

  @Get('export-csv')
  async exportCsv(@Res() res: Response, @Query('periodId') periodId?: string) {
    const csvData = await this.adminService.exportApplicantsToCsv(periodId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `Data_Pendaftar_PMB_${Date.now()}.csv`,
    );
    return res.status(200).send(csvData);
  }
  @Get('audit-logs')
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}