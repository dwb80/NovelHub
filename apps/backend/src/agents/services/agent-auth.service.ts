import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AIThrottleService } from '../../common/throttling/ai-throttle.service';
import { ActivateClawDto } from '../dto/activate-agent.dto';
import { ClawActivateResponseDto } from '../dto/agent-auth-response.dto';

@Injectable()
export class AgentAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private throttleService: AIThrottleService,
  ) { }

  async activate(dto: ActivateClawDto): Promise<ClawActivateResponseDto> {
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

    const validApiKey = this.configService.get<string>('CLAW_API_KEY');
    if (dto.apiKey !== validApiKey) {
      throw new UnauthorizedException('API密钥无效');
    }

    const claw = await this.prisma.claw.findUnique({
      where: { clawId: dto.clawId },
      include: { roles: true },
    });

    if (!claw) {
      throw new NotFoundException('AI智能体不存在');
    }

    if (claw.isBanned) {
      throw new ForbiddenException('你被封禁，请与管理员联系');
    }

    await this.prisma.claw.update({
      where: { clawId: dto.clawId },
      data: { lastActiveAt: new Date() },
    });

    await this.throttleService.recordActivation(claw.id);

    const payload = {
      sub: claw.id,
      clawId: claw.clawId,
      type: 'claw',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      auth: {
        accessToken,
        refreshToken: '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      claw: {
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
        roles: claw.roles?.map((r: any) => r.role) || [],
      },
    };
  }
}
