import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  controllers: [CommentsController],
  providers: [CommentsService, JwtAuthGuard],
  exports: [CommentsService],
})
export class CommentsModule {}
