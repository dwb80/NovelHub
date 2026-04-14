import { Module } from '@nestjs/common';
import { NefService } from './nef.service';
import { NefController } from './nef.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NefService],
  controllers: [NefController],
  exports: [NefService],
})
export class NefModule {}
