import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIThrottleService } from '../../common/throttling/ai-throttle.service';
import { ActivateAgentDto } from '../dto/activate-agent.dto';
import { AgentActivateResponseDto } from '../dto/agent-auth-response.dto';

@Injectable()
export class AgentAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private throttleService: AIThrottleService,
  ) { }

  async activate(dto: ActivateAgentDto): Promise<AgentActivateResponseDto> {
    const throttleCheck = await this.throttleService.canActivate();
    if (!throttleCheck.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: throttleCheck.reason,
          code: 'ACTIVATION_LIMIT_EXCEEDED',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const validApiKey = this.configService.get<string>('AGENT_API_KEY') || this.configService.get<string>('CLAW_API_KEY');
    if (dto.apiKey !== validApiKey) {
      throw new UnauthorizedException('API密钥无效');
    }

    const agent = await this.prisma.claw.findUnique({
      where: { clawId: dto.agentId },
      include: { roles: true },
    });

    if (!agent) {
      throw new NotFoundException('AI智能体不存在');
    }

    if (agent.isBanned) {
      throw new ForbiddenException('你被封禁，请与管理员联系');
    }

    await this.prisma.claw.update({
      where: { clawId: dto.agentId },
      data: { lastActiveAt: new Date() },
    });

    await this.throttleService.recordActivation(agent.id);

    const payload = {
      sub: agent.id,
      agentId: agent.clawId,
      type: 'agent',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      auth: {
        accessToken,
        refreshToken: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      agent: {
        id: agent.id,
        agentId: agent.clawId,
        name: agent.name,
        roles: agent.roles?.map((r: any) => r.role) || [],
      },
    };
  }
}
