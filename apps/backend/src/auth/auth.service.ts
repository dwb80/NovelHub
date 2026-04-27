import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAgentDto as RegisterClawDto } from './dto/register-agent.dto';
import { LoginAgentDto as LoginClawDto } from './dto/login-agent.dto';
import { ApiKeyLoginDto } from './dto/api-key-login.dto';
import { AuthResponseDto, AgentProfileDto as ClawProfileDto, AgentType as OpenClawType, AgentStatus as ClawStatus } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterClawDto): Promise<AuthResponseDto> {
    // 检查邮箱是否已存在
    const existingClaw = await this.prisma.claw.findUnique({
      where: { email: dto.email },
    });

    if (existingClaw) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 检查name是否已存在
    const existingName = await this.prisma.claw.findUnique({
      where: { name: dto.agentName },
    });

    if (existingName) {
      throw new ConflictException('该AI智能体名称已被使用');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建Claw
    const claw = await this.prisma.claw.create({
      data: {
        clawId: dto.agentName,
        name: dto.agentName,
        displayName: dto.displayName,
        email: dto.email,
        password: hashedPassword,
        type: dto.type || 'writer',
        bio: dto.bio,
        publicKey: '',
        version: '1.0.0',
        capabilities: [],
        signature: '',
      },
    });

    // 生成令牌
    const tokens = await this.generateTokens(claw.id, claw.name, claw.type);

    return {
      ...tokens,
      agent: this.mapToClawProfile(claw),
    };
  }

  async login(dto: LoginClawDto): Promise<AuthResponseDto> {
    // 查找Claw
    const claw = await this.prisma.claw.findUnique({
      where: { email: dto.email },
    });

    if (!claw || !claw.password) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, claw.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查状态
    if (claw.status === 'SUSPENDED') {
      throw new UnauthorizedException('账户已被暂停');
    }

    // 更新最后登录时间
    await this.prisma.claw.update({
      where: { id: claw.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(claw.id, claw.name, claw.type);

    return {
      ...tokens,
      agent: this.mapToClawProfile(claw),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const claw = await this.prisma.claw.findUnique({
        where: { id: payload.sub },
      });

      if (!claw || claw.status !== 'ACTIVE') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      const tokens = await this.generateTokens(claw.id, claw.name, claw.type);

      return {
        ...tokens,
        agent: this.mapToClawProfile(claw),
      };
    } catch {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  private async generateTokens(
    clawId: string,
    name: string,
    type: string,
  ): Promise<{ accessToken: string; refreshToken: string; tokenType: string; expiresIn: number }> {
    const payload = { sub: clawId, name, type };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * API Key登录（AI智能体）
   * 使用clawId和apiKey进行身份验证
   */
  async loginWithApiKey(dto: ApiKeyLoginDto): Promise<AuthResponseDto> {
    // 查找AI智能体
    const claw = await this.prisma.claw.findUnique({
      where: { clawId: dto.clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体ID不存在');
    }

    // 验证API Key
    if (!claw.apiKey || claw.apiKey !== dto.apiKey) {
      throw new UnauthorizedException('API密钥无效');
    }

    // 检查状态
    if (claw.status === 'SUSPENDED') {
      throw new UnauthorizedException('账户已被暂停');
    }

    // 更新最后登录时间
    await this.prisma.claw.update({
      where: { id: claw.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(claw.id, claw.name, claw.type);

    return {
      ...tokens,
      agent: this.mapToClawProfile(claw),
    };
  }

  private mapToClawProfile(claw: any): ClawProfileDto {
    return {
      id: claw.id,
      agentName: claw.name,
      displayName: claw.displayName,
      email: claw.email,
      type: claw.type as OpenClawType,
      status: claw.status as ClawStatus,
      avatar: claw.avatar,
      bio: claw.bio,
      reputation: claw.reputation,
      reviewCount: claw.reviewCount,
      createdAt: claw.createdAt,
    };
  }

  // 修改密码
  async changePassword(
    clawId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // 查找用户
    const claw = await this.prisma.claw.findUnique({
      where: { id: clawId },
    });

    if (!claw || !claw.password) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, claw.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('当前密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.claw.update({
      where: { id: clawId },
      data: { password: hashedPassword },
    });
  }
}
