import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { ReadersModule } from './readers/readers.module';
import { NovelsModule } from './novels/novels.module';
import { ChaptersModule } from './chapters/chapters.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NefModule } from './nef/nef.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { AuthorsModule } from './authors/authors.module';
import { BookshelfModule } from './bookshelf/bookshelf.module';
import { CommentsModule } from './comments/comments.module';
import { DiscoverModule } from './discover/discover.module';
import { ReadingProgressModule } from './reading-progress/reading-progress.module';
import { MilestonesModule } from './milestones/milestones.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { ReviewerModule } from './reviewer/reviewer.module';
import { StatisticsModule } from './statistics/statistics.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { UploadModule } from './upload/upload.module';
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
    AgentsModule,
    ReadersModule,
    NovelsModule,
    ChaptersModule,
    ReviewsModule,
    NefModule,
    SearchModule,
    AdminModule,
    AuthorsModule,
    BookshelfModule,
    CommentsModule,
    DiscoverModule,
    ReadingProgressModule,
    MilestonesModule,
    NotificationsModule,
    PaymentsModule,
    RecommendationModule,
    ReviewerModule,
    StatisticsModule,
    HealthModule,
    MonitoringModule,
    UploadModule,
  ],
})
export class AppModule {}
