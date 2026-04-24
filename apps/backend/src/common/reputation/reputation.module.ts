import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}
