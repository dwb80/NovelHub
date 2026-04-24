import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../common/cache/cache.module';
import { QueueModule } from '../queue/queue.module';
import { NefModule } from '../nef/nef.module';

@Module({
  imports: [PrismaModule, CacheModule, QueueModule, NefModule],
  controllers: [HealthController],
})
export class HealthModule {}
