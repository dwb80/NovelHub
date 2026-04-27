import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { LoginAgentDto } from './dto/login-agent.dto';
import { ApiKeyLoginDto } from './dto/api-key-login.dto';
import { AuthResponseDto, AgentProfileDto, AgentType, AgentStatus } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterAgentDto): Promise<AuthResponseDto> {
    // 检查邮箱是否已存在
    const existingAgent = await this.prisma.claw.findUnique({
      where: { email: dto.email },
    });

    if (existingAgent) {
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

    // 创建AI智能体
    const agent = await this.prisma.claw.create({
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
    const tokens = await this.generateTokens(agent.id, agent.name, agent.type);

    return {
      ...tokens,
      agent: this.mapToAgentProfile(agent),
    };
  }

  async login(dto: LoginAgentDto): Promise<AuthResponseDto> {
    // 查找AI智能体
    const agent = await this.prisma.claw.findUnique({
      where: { email: dto.email },
    });

    if (!agent || !agent.password) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, agent.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查状态
    if (agent.status === 'SUSPENDED') {
      throw new UnauthorizedException('账户已被暂停');
    }

    // 更新最后登录时间
    await this.prisma.claw.update({
      where: { id: agent.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(agent.id, agent.name, agent.type);

    return {
      ...tokens,
      agent: this.mapToAgentProfile(agent),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const agent = await this.prisma.claw.findUnique({
        where: { id: payload.sub },
      });

      if (!agent || agent.status !== 'ACTIVE') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      const tokens = await this.generateTokens(agent.id, agent.name, agent.type);

      return {
        ...tokens,
        agent: this.mapToAgentProfile(agent),
      };
    } catch {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  private async generateTokens(
    agentId: string,
    name: string,
    type: string,
  ): Promise<{ accessToken: string; refreshToken: string; tokenType: string; expiresIn: number }> {
    const payload = { sub: agentId, name, type };

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
   * 使用agentId和apiKey进行身份验证
   */
  async loginWithApiKey(dto: ApiKeyLoginDto): Promise<AuthResponseDto> {
    // 查找AI智能体
    const agent = await this.prisma.claw.findUnique({
      where: { clawId: dto.agentId },
    });

    if (!agent) {
      throw new UnauthorizedException('AI智能体ID不存在');
    }

    // 验证API Key
    if (!agent.apiKey || agent.apiKey !== dto.apiKey) {
      throw new UnauthorizedException('API密钥无效');
    }

    // 检查状态
    if (agent.status === 'SUSPENDED') {
      throw new UnauthorizedException('账户已被暂停');
    }

    // 更新最后登录时间
    await this.prisma.claw.update({
      where: { id: agent.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成令牌
    const tokens = await this.generateTokens(agent.id, agent.name, agent.type);

    return {
      ...tokens,
      agent: this.mapToAgentProfile(agent),
    };
  }

  private mapToAgentProfile(agent: any): AgentProfileDto {
    return {
      id: agent.id,
      agentName: agent.name,
      displayName: agent.displayName,
      email: agent.email,
      type: agent.type as AgentType,
      status: agent.status as AgentStatus,
      avatar: agent.avatar,
      bio: agent.bio,
      reputation: agent.reputation,
      reviewCount: agent.reviewCount,
      createdAt: agent.createdAt,
    };
  }

  // 修改密码
  async changePassword(
    agentId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // 查找用户
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
    });

    if (!agent || !agent.password) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, agent.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('当前密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.claw.update({
      where: { id: agentId },
      data: { password: hashedPassword },
    });
  }
}
