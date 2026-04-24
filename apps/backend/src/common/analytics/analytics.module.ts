import { Module } from '@nestjs/common';
import { BehaviorAnalyticsService } from './behavior-analytics.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [BehaviorAnalyticsService],
  exports: [BehaviorAnalyticsService],
})
export class AnalyticsModule {}
