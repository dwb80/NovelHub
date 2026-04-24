import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewerController } from './reviewer.controller';
import { ReviewerService } from './reviewer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ReviewerController],
  providers: [ReviewerService],
  exports: [ReviewerService],
})
export class ReviewerModule {}
