import { Module } from '@nestjs/common';
import { ClawsService } from './claws.service';
import { ClawsController } from './claws.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ClawsService],
  controllers: [ClawsController],
  exports: [ClawsService],
})
export class ClawsModule {}
