import { Module } from '@nestjs/common';
import { PublishingLimitService } from './publishing-limit.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [PrismaModule, CacheModule, AnalyticsModule],
  providers: [PublishingLimitService],
  exports: [PublishingLimitService],
})
export class PublishingModule {}
