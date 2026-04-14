import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClawsModule } from './claws/claws.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NefModule } from './nef/nef.module';
import { PrismaModule } from './prisma/prisma.module';
import { databaseConfig, jwtConfig, appConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    PrismaModule,
    AuthModule,
    ClawsModule,
    NovelsModule,
    ChaptersModule,
    ReviewsModule,
    NefModule,
  ],
})
export class AppModule {}
