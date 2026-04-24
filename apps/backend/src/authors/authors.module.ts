import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthorsController } from './authors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthorsController],
})
export class AuthorsModule {}
