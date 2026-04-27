import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { RegisterReaderDto } from './dto/register-reader.dto';
import { LoginReaderDto } from './dto/login-reader.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ReaderProfileDto, ReaderAuthResponseDto } from './dto/reader-response.dto';
import { ReaderStatsDto } from './dto/reader-stats.dto';
import { ReadingHistoryItemDto, ReadingHistoryResponseDto } from './dto/reading-history.dto';

@Injectable()
export class ReadersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) { }

  async register(dto: RegisterReaderDto): Promise<ReaderAuthResponseDto> {
    // 检查邮箱是否已存在
    const existingByEmail = await this.prisma.reader.findUnique({
      where: { email: dto.email },
    });

    if (existingByEmail) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 检查读者名称是否已存在
    const existingByUsername = await this.prisma.reader.findUnique({
      where: { username: dto.readerName },
    });

    if (existingByUsername) {
      throw new ConflictException('该读者名称已被使用');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerificationToken = uuidv4();
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时过期

    // 创建Reader
    const reader = await this.prisma.reader.create({
      data: {
        email: dto.email,
        username: dto.readerName,
        password: dto.password,
        passwordHash,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpiresAt,
      },
    });

    // 发送邮箱验证邮件
    const verificationLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/verify-email?token=${emailVerificationToken}`;
    
    this.emailService.sendEmail({
      to: dto.email,
      subject: '[NovelHub] 邮箱验证',
      html: `
        <h1>欢迎注册 NovelHub</h1>
        <p>请点击以下链接验证您的邮箱：</p>
        <a href="${verificationLink}">点击验证邮箱</a>
        <p>该链接将在24小时后过期</p>
        <p>如果您没有注册 NovelHub 账号，请忽略此邮件</p>
      `,
      text: `欢迎注册 NovelHub，请点击以下链接验证您的邮箱：${verificationLink}，该链接将在24小时后过期。如果您没有注册 NovelHub 账号，请忽略此邮件。`,
    }).catch((error) => {
      // 邮件发送失败不影响注册流程，但需要记录日志
      console.error('邮件发送失败:', error);
    });

    const tokens = await this.generateTokens(reader.id);

    // 发送新用户注册通知给管理员
    this.notificationsService.notifyNewUserRegistered({
      userId: reader.id,
      username: reader.username,
      email: reader.email,
    }).catch(() => {
      // 通知发送失败不影响注册流程
    });

    return {
      ...tokens,
      reader: this.mapToReaderProfile(reader),
    };
  }

  async login(dto: LoginReaderDto): Promise<ReaderAuthResponseDto> {
    // 通过邮箱或用户名查找读者
    const reader = await this.prisma.reader.findFirst({
      where: {
        OR: [
          { email: dto.account },
          { username: dto.account },
        ],
      },
    });

    if (!reader) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, reader.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 检查读者是否被封禁
    if (reader.isDeleted) {
      throw new ForbiddenException('你被封禁，请与管理员联系');
    }

    // 检查邮箱是否已验证
    // if (!reader.emailVerified) {
    //   throw new ForbiddenException('请先验证邮箱后再登录');
    // }

    // 更新最后登录时间
    await this.prisma.reader.update({
      where: { id: reader.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(reader.id);

    return {
      ...tokens,
      reader: this.mapToReaderProfile({ ...reader, lastLoginAt: new Date() }),
    };
  }

  async refreshTokens(refreshToken: string): Promise<ReaderAuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const reader = await this.prisma.reader.findUnique({
        where: { id: payload.sub },
      });

      if (!reader) {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      const tokens = await this.generateTokens(reader.id);

      return {
        ...tokens,
        reader: this.mapToReaderProfile(reader),
      };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async getProfile(readerId: string): Promise<ReaderProfileDto> {
    const reader = await this.prisma.reader.findUnique({
      where: { id: readerId },
    });

    if (!reader) {
      throw new NotFoundException('读者不存在');
    }

    return this.mapToReaderProfile(reader);
  }

  async updateProfile(readerId: string, dto: UpdateProfileDto): Promise<ReaderProfileDto> {
    const reader = await this.prisma.reader.findUnique({
      where: { id: readerId },
    });

    if (!reader) {
      throw new NotFoundException('读者不存在');
    }

    // 如果更新用户名，检查是否已存在
    if (dto.username && dto.username !== reader.username) {
      const existing = await this.prisma.reader.findUnique({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException('该用户名已被使用');
      }
    }

    const updatedReader = await this.prisma.reader.update({
      where: { id: readerId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    return this.mapToReaderProfile(updatedReader);
  }

  private async generateTokens(readerId: string) {
    const expiresIn = '30m';
    const accessToken = this.jwtService.sign(
      { sub: readerId, type: 'reader' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: readerId, type: 'reader' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

    return { accessToken, refreshToken, expiresAt };
  }

  async getBoundAgents(readerId: string): Promise<any[]> {
    const readerAgents = await this.prisma.readerClaw.findMany({
      where: { readerId },
      include: {
        claw: {
          include: {
            roles: true,
            reviewerStats: true,
          },
        },
      },
    });

    return readerAgents.map((rc: any) => ({
      id: rc.claw.id,
      agentId: rc.claw.clawId,
      displayName: rc.claw.name,
      agentName: rc.claw.clawId,
      isWriter: rc.claw.roles.some((r: any) => r.role === 'AUTHOR'),
      isReviewer: rc.claw.roles.some((r: any) => r.role === 'REVIEWER') || !!rc.claw.reviewerStats,
      status: rc.claw.isActive ? 'active' : 'inactive',
      reputationScore: rc.claw.reputationScore,
      createdAt: rc.createdAt,
    }));
  }

  private mapToReaderProfile(reader: any): ReaderProfileDto {
    return {
      id: reader.id,
      username: reader.username,
      email: reader.email,
      avatar: reader.avatar,
      readCount: reader.readCount,
      commentCount: reader.commentCount,
      createdAt: reader.createdAt,
      lastLoginAt: reader.lastLoginAt,
    };
  }

  /**
   * 获取读者统计数据
   */
  async getReaderStats(readerId: string): Promise<ReaderStatsDto> {
    const reader = await this.prisma.reader.findUnique({
      where: { id: readerId },
    });

    if (!reader) {
      throw new NotFoundException('读者不存在');
    }

    // 获取阅读历史统计
    const readingHistory = await this.prisma.readingHistory.findMany({
      where: { readerId },
    });

    // 计算统计数据
    const totalReadingTime = readingHistory.reduce((sum, h) => sum + (h.readTime || 0), 0);
    const uniqueNovels = new Set(readingHistory.map(h => h.novelId)).size;
    const chaptersRead = readingHistory.length;
    
    // 估算阅读字数（假设平均每个章节3000字）
    const wordsRead = chaptersRead * 3000;

    // 计算等级和经验值（简单算法：每读100分钟获得10经验）
    const expPerMinute = 0.1;
    const totalExp = Math.floor(totalReadingTime * expPerMinute);
    const level = Math.floor(Math.sqrt(totalExp / 100)) + 1;
    const nextLevelExp = Math.pow(level, 2) * 100;
    const currentLevelExp = Math.pow(level - 1, 2) * 100;
    const exp = totalExp - currentLevelExp;

    return {
      totalReadingTime: Math.floor(totalReadingTime / 60), // 转换为分钟
      booksRead: uniqueNovels,
      chaptersRead,
      wordsRead,
      level,
      exp,
      nextLevelExp: nextLevelExp - currentLevelExp,
      joinDate: reader.createdAt.toISOString(),
    };
  }

  /**
   * 获取阅读历史
   */
  async getReadingHistory(
    readerId: string,
    limit: number = 10,
    page: number = 1,
  ): Promise<ReadingHistoryResponseDto> {
    const skip = (page - 1) * limit;

    // 获取阅读历史总数
    const total = await this.prisma.readingHistory.count({
      where: { readerId },
    });

    // 获取阅读历史列表
    const history = await this.prisma.readingHistory.findMany({
      where: { readerId },
      orderBy: { readAt: 'desc' },
      skip,
      take: limit,
    });

    // 获取相关小说和章节信息
    const activities: ReadingHistoryItemDto[] = await Promise.all(
      history.map(async (h) => {
        // 获取小说信息
        const novel = await this.prisma.novel.findUnique({
          where: { id: h.novelId },
          select: { title: true, cover: true },
        });

        // 获取章节信息
        const chapter = await this.prisma.chapter.findUnique({
          where: { id: h.chapterId },
          select: { title: true },
        });

        return {
          id: h.id,
          novelId: h.novelId,
          novelTitle: novel?.title || '未知小说',
          chapterId: h.chapterId,
          chapterTitle: chapter?.title || '未知章节',
          progress: Math.round(h.progress * 100) / 100,
          readTime: h.readTime || 0,
          readAt: h.readAt.toISOString(),
          cover: novel?.cover || undefined,
        };
      }),
    );

    return {
      activities,
      total,
      page,
      limit,
    };
  }

  /**
   * 清空阅读历史
   */
  async clearReadingHistory(readerId: string): Promise<void> {
    await this.prisma.readingHistory.deleteMany({
      where: { readerId },
    });
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string): Promise<boolean> {
    // 查找读者
    const reader = await this.prisma.reader.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!reader) {
      throw new BadRequestException('无效的验证链接');
    }

    // 检查令牌是否过期
    if (reader.emailVerificationExpiresAt && reader.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('验证链接已过期');
    }

    // 验证邮箱
    await this.prisma.reader.update({
      where: { id: reader.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return true;
  }
}
