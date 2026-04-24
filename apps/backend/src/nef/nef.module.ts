import { Module } from '@nestjs/common';
import { NefService } from './nef.service';
import { ForgeScoreService } from './services/forge-score.service';
import { NefAlgorithmService } from './algorithms/nef-algorithm.service';
import { NefController } from './nef.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [NefService, ForgeScoreService, NefAlgorithmService],
  controllers: [NefController],
  exports: [NefService, ForgeScoreService, NefAlgorithmService],
})
export class NefModule {}
