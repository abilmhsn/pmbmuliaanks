import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RateLimitGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule { }
