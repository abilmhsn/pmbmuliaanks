import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  /**
   * Public: Pengaturan global untuk homepage / portal
   */
  @Get('public/settings')
  async getPublicSettings() {
    return this.superAdminService.getPublicSettings();
  }

  /**
   * Executive Dashboard Stats
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('stats')
  async getExecutiveStats(@Query('periodId') periodId?: string) {
    return this.superAdminService.getExecutiveStats(periodId);
  }

  /**
   * Daftar Seluruh Pengguna
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('users')
  async getUsers(
    @Query('role') role?: Role,
    @Query('search') search?: string,
  ) {
    return this.superAdminService.getUsers(role, search);
  }

  /**
   * Tambah Akun Admin / Super Admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('users/admin')
  async createAdmin(
    @Body() dto: { email: string; password: string; fullName?: string; role?: Role },
    @CurrentUser() admin: any,
  ) {
    return this.superAdminService.createAdmin(dto, admin);
  }

  /**
   * Ubah Role Pengguna
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: Role,
    @CurrentUser() admin: any,
  ) {
    return this.superAdminService.updateUserRole(userId, role, admin);
  }

  /**
   * Reset Password Pengguna Langsung
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put('users/:id/reset-password')
  async resetUserPassword(
    @Param('id') userId: string,
    @Body('password') password: string,
    @CurrentUser() admin: any,
  ) {
    return this.superAdminService.resetUserPassword(userId, password, admin);
  }

  /**
   * Hapus Pengguna
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete('users/:id')
  async deleteUser(
    @Param('id') userId: string,
    @CurrentUser() admin: any,
  ) {
    return this.superAdminService.deleteUser(userId, admin);
  }

  /**
   * Riwayat Audit Log Sistem
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('audit-logs')
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('limit') limit?: number,
  ) {
    return this.superAdminService.getAuditLogs(action, limit ? Number(limit) : 100);
  }

  /**
   * Dapatkan Semua Pengaturan Sistem
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('settings')
  async getSettings() {
    return this.superAdminService.getSettings();
  }

  /**
   * Perbarui Pengaturan Sistem
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Put('settings')
  async updateSettings(
    @Body() body: Record<string, string>,
    @CurrentUser() admin: any,
  ) {
    return this.superAdminService.updateSettings(body, admin);
  }

  /**
   * Bersihkan Seluruh Keranjang Sampah Sekaligus
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('maintenance/purge-trash')
  async purgeTrash(@CurrentUser() admin: any) {
    return this.superAdminService.purgeTrash(admin);
  }
}
