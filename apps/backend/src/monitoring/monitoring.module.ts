import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from '../common/monitoring/monitoring.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsModule } from '../common/analytics/analytics.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    AnalyticsModule,
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
