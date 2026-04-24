import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { BookshelfController } from './bookshelf.controller';
import { BookshelfService } from './bookshelf.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  controllers: [BookshelfController],
  providers: [BookshelfService, JwtAuthGuard],
  exports: [BookshelfService],
})
export class BookshelfModule {}
