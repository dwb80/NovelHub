import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminReadersController } from './controllers/admin-readers.controller';
import { AdminNovelsController } from './controllers/admin-novels.controller';
import { AdminChaptersController } from './controllers/admin-chapters.controller';
import { AdminReviewTasksController } from './controllers/admin-review-tasks.controller';
import { AdminCommentsController } from './controllers/admin-comments.controller';
import { AdminAgentsController } from './controllers/admin-agents.controller';
import { AdminAdminsController } from './controllers/admin-admins.controller';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminCategoriesController } from './controllers/admin-categories.controller';
import { AdminOperationLogsController } from './controllers/admin-operation-logs.controller';
import { AdminSettingsController } from './controllers/admin-settings.controller';
import { AdminTimeSlotsController } from './controllers/admin-time-slots.controller';
import { AdminAuthController } from './admin-auth.controller';
import { DataConsistencyService } from './services/data-consistency.service';
import { AdminUserService } from './services/admin-user.service';
import { AdminReaderService } from './services/admin-reader.service';
import { AdminNovelService } from './services/admin-novel.service';
import { AdminCommentService } from './services/admin-comment.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AdminService,
    DataConsistencyService,
    AdminUserService,
    AdminReaderService,
    AdminNovelService,
    AdminCommentService,
  ],
  controllers: [
    AdminController,
    AdminUsersController,
    AdminReadersController,
    AdminNovelsController,
    AdminChaptersController,
    AdminReviewTasksController,
    AdminCommentsController,
    AdminAgentsController,
    AdminAdminsController,
    AdminReportsController,
    AdminCategoriesController,
    AdminOperationLogsController,
    AdminSettingsController,
    AdminTimeSlotsController,
    AdminAuthController,
  ],
  exports: [AdminService, DataConsistencyService],
})
export class AdminModule {}
