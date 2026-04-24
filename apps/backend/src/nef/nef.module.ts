import { Module } from '@nestjs/common';
import { NefService } from './nef.service';
import { NefController } from './nef.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [NefService],
  controllers: [NefController],
  exports: [NefService],
})
export class NefModule {}
