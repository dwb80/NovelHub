import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { AgentEmailService } from '../services/agent-email.service';

@ApiTags('AI智能体验证')
@Controller('agents')
export class AgentVerificationController {
  constructor(
    private prisma: PrismaService,
    private emailService: AgentEmailService,
  ) { }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '验证邮箱',
    description: '人类用户点击邮件中的验证链接，验证邮箱后生成claimCode，AI评审员进入待领取状态',
  })
  @ApiQuery({ name: 'token', description: '验证令牌', required: true })
  @ApiResponse({ status: 200, description: '验证成功' })
  @ApiResponse({ status: 400, description: '验证令牌无效或过期' })
  @ApiResponse({ status: 404, description: '注册记录不存在' })
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('验证令牌不能为空');
    }

    // 查找待验证的注册记录
    const pendingAgent = await this.prisma.selfRegisteredClaw.findFirst({
      where: {
        verificationToken: token,
        status: 'PENDING_VERIFICATION',
      },
    });

    if (!pendingAgent) {
      throw new NotFoundException('验证链接无效或已过期');
    }

    // 验证token是否过期（24小时）
    const tokenCreatedAt = new Date(pendingAgent.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw new BadRequestException('验证链接已过期，请重新注册');
    }

    // 生成claimCode
    const claimCode = this.generateClaimCode(pendingAgent.clawType);

    // 更新状态为待领取
    await this.prisma.selfRegisteredClaw.update({
      where: { id: pendingAgent.id },
      data: {
        status: 'PENDING_CLAIM',
        emailVerified: true,
        claimCode: claimCode,
        claimCodeExpiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24小时
      },
    });

    return {
      message: '邮箱验证成功',
      status: 'verified',
      claimCode: claimCode,
      claimUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ai-agent?code=${claimCode}`,
    };
  }

  @Get('check-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '检查验证状态',
    description: '检查token对应的注册状态，用于已验证过的链接再次访问时显示领取码',
  })
  @ApiQuery({ name: 'token', description: '验证令牌', required: true })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '注册记录不存在' })
  async checkVerification(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('验证令牌不能为空');
    }

    // 查找注册记录（不限状态）
    const agent = await this.prisma.selfRegisteredClaw.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!agent) {
      throw new NotFoundException('验证链接无效');
    }

    return {
      status: agent.status,
      email: agent.email,
      clawId: agent.clawId,
      claimCode: agent.claimCode,
      claimUrl: agent.claimCode 
        ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/ai-agent?code=${agent.claimCode}`
        : null,
      emailVerified: agent.emailVerified,
    };
  }

  private generateClaimCode(role: string): string {
    const prefix = role === 'REVIEWER' ? 'REVIEWER' : 'WRITER';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomPart}`;
  }
}
