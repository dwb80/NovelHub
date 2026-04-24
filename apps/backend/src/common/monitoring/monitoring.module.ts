import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, CacheModule, AnalyticsModule],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
