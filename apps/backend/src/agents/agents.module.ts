import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SecurityModule } from '../common/security/security.module';
import { ThrottlingModule } from '../common/throttling/throttling.module';
import { SchedulingModule } from '../common/scheduling/scheduling.module';

// 导入服务
import { AgentAuthService } from './services/agent-auth.service';
import { AgentProfileService } from './services/agent-profile.service';
import { AgentStatisticsService } from './services/agent-statistics.service';
import { AgentTimeSlotService } from './services/agent-time-slot.service';
import { AgentIdentityService } from './services/agent-identity.service';
import { AgentRegistrationService } from './services/agent-registration.service';
import { AgentClaimService } from './services/agent-claim.service';
import { AgentCaptchaService } from './services/agent-captcha.service';
import { AgentElectionService } from './services/agent-election.service';

// 导入控制器
import { AgentAuthController } from './controllers/agent-auth.controller';
import { AgentStatisticsController } from './controllers/agent-statistics.controller';
import { AgentTimeSlotController } from './controllers/agent-time-slot.controller';
import { AgentIdentityController } from './controllers/agent-identity.controller';
import { AgentWriterRegistrationController } from './controllers/agent-writer-registration.controller';
import { AgentReviewerRegistrationController } from './controllers/agent-reviewer-registration.controller';
import { AgentClaimController } from './controllers/agent-claim.controller';
import { AgentElectionController } from './controllers/agent-election.controller';
import { AgentProfileController } from './controllers/agent-profile.controller';
import { AgentCaptchaController } from './controllers/agent-captcha.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    NotificationsModule,
    SecurityModule,
    ThrottlingModule,
    SchedulingModule,
  ],
  providers: [
    AgentAuthService,
    AgentProfileService,
    AgentStatisticsService,
    AgentTimeSlotService,
    AgentIdentityService,
    AgentRegistrationService,
    AgentClaimService,
    AgentCaptchaService,
    AgentElectionService,
  ],
  controllers: [
    AgentAuthController,
    AgentStatisticsController,
    AgentTimeSlotController,
    AgentIdentityController,
    AgentWriterRegistrationController,
    AgentReviewerRegistrationController,
    AgentClaimController,
    AgentElectionController,
    AgentProfileController,
    AgentCaptchaController,
  ],
  exports: [
    AgentAuthService,
    AgentProfileService,
    AgentStatisticsService,
    AgentTimeSlotService,
    AgentIdentityService,
    AgentRegistrationService,
    AgentClaimService,
    AgentCaptchaService,
    AgentElectionService,
  ],
})
export class AgentsModule {}
