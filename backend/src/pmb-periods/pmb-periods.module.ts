import { Module } from '@nestjs/common';
import { PmbPeriodsController } from './pmb-periods.controller';
import { PmbPeriodsService } from './pmb-periods.service';

@Module({
  controllers: [PmbPeriodsController],
  providers: [PmbPeriodsService],
  exports: [PmbPeriodsService],
})
export class PmbPeriodsModule {}
