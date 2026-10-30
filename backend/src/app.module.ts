
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { StudyProgramsModule } from './study-programs/study-programs.module';
import { PmbPeriodsModule } from './pmb-periods/pmb-periods.module';
import { DocumentsModule } from './documents/documents.module';
import { PaymentsModule } from './payments/payments.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ApplicantsModule,
    StudyProgramsModule,
    PmbPeriodsModule,
    DocumentsModule,
    PaymentsModule,
    AnnouncementsModule,
    AdminModule,
  ],
})
export class AppModule { }
