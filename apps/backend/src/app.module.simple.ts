import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ReadersModule } from './readers/readers.module';
import { AgentsModule } from './agents/agents.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { BookshelfModule } from './bookshelf/bookshelf.module';
import { CommentsModule } from './comments/comments.module';
import { SearchModule } from './search/search.module';
import { PrismaModule } from './prisma/prisma.module';
import { databaseConfig, jwtConfig, appConfig, envConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env'],
      load: [databaseConfig, jwtConfig, appConfig, envConfig],
    }),
    PrismaModule,
    AuthModule,
    ReadersModule,
    AgentsModule,
    NovelsModule,
    ChaptersModule,
    BookshelfModule,
    CommentsModule,
    SearchModule,
  ],
})
export class AppModuleSimple { }
