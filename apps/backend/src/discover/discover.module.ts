import { Module } from '@nestjs/common';
import { DiscoverService } from './discover.service';
import { DiscoverController } from './discover.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiscoverController],
  providers: [DiscoverService],
  exports: [DiscoverService],
})
export class DiscoverModule {}
