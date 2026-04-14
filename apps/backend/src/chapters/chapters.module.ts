import { Module } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChaptersController } from './chapters.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ChaptersService],
  controllers: [ChaptersController],
  exports: [ChaptersService],
})
export class ChaptersModule {}
