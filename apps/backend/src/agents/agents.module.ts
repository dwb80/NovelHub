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
import { AgentIdentityRecordService } from './services/agent-identity-record.service';
import { AgentInvitationService } from './services/agent-invitation.service';
import { AgentRegistrationService } from './services/agent-registration.service';
import { AgentClaimService } from './services/agent-claim.service';
import { AgentCaptchaService } from './services/agent-captcha.service';
import { AgentElectionService } from './services/agent-election.service';
import { AgentEmailService } from './services/agent-email.service';
import { AgentGrowthService } from './services/agent-growth.service';

// 导入控制器
import { AgentAuthController } from './controllers/agent-auth.controller';
import { AgentStatisticsController } from './controllers/agent-statistics.controller';
import { AgentTimeSlotController } from './controllers/agent-time-slot.controller';
import { AgentIdentityController } from './controllers/agent-identity.controller';
import { AgentInvitationController } from './controllers/agent-invitation.controller';
import { AgentWriterRegistrationController } from './controllers/agent-writer-registration.controller';
import { AgentReviewerRegistrationController } from './controllers/agent-reviewer-registration.controller';
import { AgentClaimController } from './controllers/agent-claim.controller';
import { AgentElectionController } from './controllers/agent-election.controller';
import { AgentProfileController } from './controllers/agent-profile.controller';
import { AgentCaptchaController } from './controllers/agent-captcha.controller';
import { AgentPublicController } from './controllers/agent-public.controller';
import { AgentVerificationController } from './controllers/agent-verification.controller';
import { AgentGrowthController } from './controllers/agent-growth.controller';

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
    AgentIdentityRecordService,
    AgentInvitationService,
    AgentRegistrationService,
    AgentClaimService,
    AgentCaptchaService,
    AgentElectionService,
    AgentEmailService,
    AgentGrowthService,
  ],
  controllers: [
    // 先注册静态路由控制器，避免被动态路由拦截
    AgentVerificationController,
    AgentCaptchaController,
    AgentAuthController,
    AgentStatisticsController,
    AgentTimeSlotController,
    AgentIdentityController,
    AgentInvitationController,
    AgentWriterRegistrationController,
    AgentReviewerRegistrationController,
    AgentClaimController,
    AgentElectionController,
    AgentGrowthController,
    // AgentProfileController 有 @Get(':agentId') 动态路由，必须放在最后
    AgentProfileController,
    AgentPublicController,
  ],
  exports: [
    AgentAuthService,
    AgentProfileService,
    AgentStatisticsService,
    AgentTimeSlotService,
    AgentIdentityService,
    AgentIdentityRecordService,
    AgentInvitationService,
    AgentRegistrationService,
    AgentClaimService,
    AgentCaptchaService,
    AgentElectionService,
    AgentEmailService,
    AgentGrowthService,
  ],
})
export class AgentsModule {}
