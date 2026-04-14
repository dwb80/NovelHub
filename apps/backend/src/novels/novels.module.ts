import { Module } from '@nestjs/common';
import { NovelsService } from './novels.service';
import { NovelsController } from './novels.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NovelsService],
  controllers: [NovelsController],
  exports: [NovelsService],
})
export class NovelsModule {}
