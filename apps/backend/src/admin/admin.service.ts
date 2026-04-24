import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Prisma, Admin } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminAuthResponseDto, AdminStatisticsDto, AdminProfileDto } from './dto/admin-response.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) { }

  async login(dto: AdminLoginDto): Promise<AdminAuthResponseDto> {
    // 查找管理员
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });

    if (!admin) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 检查账号是否被封禁
    if (admin.isBanned) {
      throw new ForbiddenException('您已被封禁，请与管理员联系');
    }

    // 检查账号是否被锁定
    if (admin.locked_until && admin.locked_until > new Date()) {
      throw new ForbiddenException('账号已锁定，请稍后再试');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, admin.passwordHash);

    if (!isPasswordValid) {
      // 增加登录失败次数
      const loginAttempts = admin.loginAttempts + 1;
      const locked_until = loginAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginAttempts,
          locked_until,
        },
      });

      throw new UnauthorizedException('账号或密码错误');
    }

    // 登录成功，重置失败次数
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        loginAttempts: 0,
        locked_until: null,
      },
    });

    // 生成令牌
    const token = this.jwtService.sign(
      { sub: admin.id, type: 'admin' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '30m',
      },
    );

    return {
      token,
      admin: this.mapToAdminProfile(admin),
    };
  }

  async getStatistics(): Promise<AdminStatisticsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalReaders,
      newReadersToday,
      totalClaws,
      authorClaws,
      reviewerClaws,
      totalNovels,
      pendingNovels,
      pendingReviews,
      completedReviewsToday,
    ] = await Promise.all([
      this.prisma.reader.count(),
      this.prisma.reader.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      this.prisma.claw.count(),
      this.prisma.claw.count({
        where: {
          roles: { some: { role: 'AUTHOR' } },
        },
      }),
      this.prisma.claw.count({
        where: {
          roles: { some: { role: 'REVIEWER' } },
        },
      }),
      this.prisma.novel.count(),
      this.prisma.novel.count({ where: { status: 'PENDING' } }),
      this.prisma.reviewTask.count({ where: { status: 'PENDING' } }),
      this.prisma.review.count({
        where: {
          createdAt: { gte: today },
        },
      }),
    ]);

    return {
      totalReaders,
      newReadersToday,
      totalClaws,
      authorClaws,
      reviewerClaws,
      totalNovels,
      pendingNovels,
      pendingReviews,
      completedReviewsToday,
    };
  }

  async getProfile(adminId: string): Promise<AdminProfileDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    return this.mapToAdminProfile(admin);
  }

  private mapToAdminProfile(admin: Admin & { permissions?: string[] }): AdminProfileDto {
    return {
      id: admin.id,
      username: admin.username,
      name: admin.name || admin.username,
      email: admin.email || '',
      avatar: admin.avatar,
      permissions: admin.permissions || [],
      isSuperAdmin: admin.isSuperAdmin,
    };
  }

  // ========== 用户管理 ==========
  async getUsers(params: { page?: number; limit?: number; search?: string; status?: string }) {
    const { page = 1, limit = 20, search, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ClawWhereInput = {};
    if (status === 'banned') {
      where.isBanned = true;
    } else if (status === 'active') {
      where.isBanned = false;
    }
    if (search) {
      where.OR = [
        { clawId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: true,
          _count: {
            select: {
              novels: true,
              reviews: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    type UserWithCount = typeof users[0];

    return {
      users: users.map((user: UserWithCount) => ({
        id: user.id,
        clawId: user.clawId,
        name: user.name,
        reputationScore: user.reputationScore,
        publishCount: user.publishCount,
        reviewCount: user.reviewCount,
        roles: user.roles.map((r: { role: string }) => r.role),
        novelCount: user._count.novels,
        reviewCountTotal: user._count.reviews,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, status: { isActive?: boolean; isBanned?: boolean }) {
    const user = await this.prisma.claw.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 更新用户状态
    const updateData: any = {};
    if (status.isBanned !== undefined) {
      updateData.isBanned = status.isBanned;
    }

    await this.prisma.claw.update({
      where: { id: userId },
      data: updateData,
    });

    return { success: true, message: status.isBanned ? '用户已封禁' : '用户已解封' };
  }

  // ========== 读者管理 ==========
  async getReaders(params: { page?: number; limit?: number; status?: string; search?: string; hasBoundClaw?: boolean }) {
    const { page = 1, limit = 20, status, search, hasBoundClaw } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'banned') {
      where.isDeleted = true;
    } else if (status === 'active') {
      where.isDeleted = false;
    }
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 获取读者列表
    const [readers, total] = await Promise.all([
      this.prisma.reader.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reader.count({ where }),
    ]);

    // 获取读者的绑定AI信息
    const readerIds = readers.map(r => r.id);
    const readerClaws = await this.prisma.readerClaw.findMany({
      where: { readerId: { in: readerIds } },
      include: {
        claw: {
          include: {
            roles: true,
          },
        },
      },
    });

    // 按 readerId 分组
    const clawsByReader = new Map<string, typeof readerClaws>();
    readerClaws.forEach(rc => {
      if (!clawsByReader.has(rc.readerId)) {
        clawsByReader.set(rc.readerId, []);
      }
      clawsByReader.get(rc.readerId)!.push(rc);
    });

    // 处理读者数据
    let readersWithClaws = readers.map((reader) => {
      const boundClawData = clawsByReader.get(reader.id) || [];
      const boundClaws = boundClawData.map((bc) => ({
        id: bc.claw.id,
        clawId: bc.claw.clawId,
        name: bc.claw.name,
        role: bc.claw.roles[0]?.role || 'AUTHOR',
        roles: bc.claw.roles.map((r) => r.role),
      }));

      return {
        id: reader.id,
        username: reader.username,
        email: reader.email,
        avatar: reader.avatar,
        readCount: reader.readCount,
        reviewCount: reader.reviewCount,
        commentCount: reader.commentCount,
        isBanned: reader.isDeleted,
        createdAt: reader.createdAt,
        lastLoginAt: reader.lastLoginAt,
        boundClaws,
      };
    });

    // 按是否绑定AI筛选
    if (hasBoundClaw !== undefined) {
      readersWithClaws = readersWithClaws.filter((r) =>
        hasBoundClaw ? r.boundClaws.length > 0 : r.boundClaws.length === 0
      );
    }

    return {
      readers: readersWithClaws,
      pagination: {
        page,
        limit,
        total: hasBoundClaw !== undefined ? readersWithClaws.length : total,
        totalPages: Math.ceil((hasBoundClaw !== undefined ? readersWithClaws.length : total) / limit),
      },
    };
  }

  async updateReaderStatus(readerId: string, isBanned: boolean, adminId?: string) {
    const reader = await this.prisma.reader.findUnique({
      where: { id: readerId },
    });

    if (!reader) {
      throw new UnauthorizedException('读者不存在');
    }

    // 使用isDeleted字段作为封禁标记
    await this.prisma.reader.update({
      where: { id: readerId },
      data: { isDeleted: isBanned },
    });

    // 记录操作日志
    await this.logOperation({
      action: isBanned ? 'BAN_READER' : 'UNBAN_READER',
      resourceType: 'READER',
      resourceId: readerId,
      adminId,
      details: {
        readerId,
        username: reader.username,
        email: reader.email,
        isBanned,
        previousState: reader.isDeleted,
      },
      success: true,
    });

    return { success: true, message: isBanned ? '读者已封禁' : '读者已解封' };
  }

  // ========== 小说管理 ==========
  async getNovels(params: { page?: number; limit?: number; status?: string; authorId?: string; authorName?: string; search?: string }) {
    const { page = 1, limit = 20, status, authorId, authorName, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;

    // 支持按AI智能体作家名称查询（模糊匹配）
    if (authorName) {
      where.author = {
        name: { contains: authorName, mode: 'insensitive' }
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, clawId: true },
          },
        },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      novels: novels.map(novel => ({
        id: novel.id,
        title: novel.title,
        description: novel.description,
        status: novel.status,
        author: novel.author,
        chapterCount: novel.chapterCount,
        commentCount: 0, // Comment模型没有关联到Novel
        viewCount: novel.viewCount,
        likeCount: 0, // Novel模型没有likeCount字段
        createdAt: novel.createdAt,
        updatedAt: novel.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateNovelStatus(novelId: string, status: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    await this.prisma.novel.update({
      where: { id: novelId },
      data: { status: status as any },
    });

    return { success: true, message: '小说状态已更新' };
  }

  async deleteNovel(novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    // 使用事务删除小说及其所有关联数据
    await this.prisma.$transaction(async (tx) => {
      // 1. 删除评论
      await tx.comment.deleteMany({
        where: { novelId },
      });

      // 2. 删除阅读历史
      await tx.readingHistory.deleteMany({
        where: { novelId },
      });

      // 3. 删除书架记录
      await tx.bookshelf.deleteMany({
        where: { novelId },
      });

      // 4. 删除评审员评分日志中的小说引用（设置为null）
      await tx.reviewerScoreLog.updateMany({
        where: { novelId },
        data: { novelId: null },
      });

      // 5. 删除支付订单中的小说引用（设置为null）
      await tx.paymentOrder.updateMany({
        where: { novelId },
        data: { novelId: null },
      });

      // 6. 最后删除小说（章节、评审任务、评审会通过级联删除）
      await tx.novel.delete({
        where: { id: novelId },
      });
    });

    return { success: true, message: '小说已删除' };
  }

  async getNovelDetail(novelId: string) {
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: { id: true, name: true, clawId: true },
        },
        chapters: {
          select: { id: true, title: true, orderIndex: true, status: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    return {
      id: novel.id,
      title: novel.title,
      description: novel.description,
      cover: novel.cover,
      status: novel.status,
      category: novel.category,
      tags: novel.tags,
      wordCount: novel.wordCount,
      chapterCount: novel.chapterCount,
      viewCount: novel.viewCount,
      rating: novel.rating,
      ratingCount: novel.ratingCount,
      author: novel.author,
      chapters: novel.chapters,
      createdAt: novel.createdAt,
      updatedAt: novel.updatedAt,
      publishedAt: novel.publishedAt,
    };
  }

  // ========== 评审员管理 ==========
  async getReviewers(params: { page?: number; limit?: number; level?: string; search?: string }) {
    const { page = 1, limit = 20, level, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { some: { role: 'REVIEWER' } },
    };

    if (search) {
      where.OR = [
        { clawId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviewers, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reputationScore: 'desc' },
        include: {
          reviewerStats: true,
          reviewerScoreLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      reviewers: reviewers.map(reviewer => ({
        id: reviewer.id,
        clawId: reviewer.clawId,
        name: reviewer.name,
        reputationScore: reviewer.reputationScore,
        stats: reviewer.reviewerStats,
        totalReviews: reviewer._count.reviews,
        recentLogs: reviewer.reviewerScoreLogs,
        createdAt: reviewer.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateReviewerLevel(reviewerId: string, level: string) {
    const reviewer = await this.prisma.claw.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new UnauthorizedException('评审员不存在');
    }

    await this.prisma.reviewerStats.updateMany({
      where: { clawId: reviewerId },
      data: { current_level: level },
    });

    return { success: true, message: '评审员等级已更新' };
  }

  async getReviewerDetail(reviewerId: string) {
    const reviewer = await this.prisma.claw.findUnique({
      where: { id: reviewerId },
      include: {
        roles: true,
        reviewerStats: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!reviewer) {
      throw new UnauthorizedException('评审员不存在');
    }

    // 检查是否有REVIEWER角色
    const hasReviewerRole = reviewer.roles.some(r => r.role === 'REVIEWER');
    if (!hasReviewerRole) {
      throw new UnauthorizedException('该用户不是评审员');
    }

    return {
      id: reviewer.id,
      clawId: reviewer.clawId,
      name: reviewer.name,
      reputationScore: reviewer.reputationScore,
      stats: reviewer.reviewerStats,
      totalReviews: reviewer._count.reviews,
      createdAt: reviewer.createdAt,
      isBanned: reviewer.isBanned,
    };
  }

  async getReviewerNovels(
    reviewerId: string,
    params: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const reviewer = await this.prisma.claw.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new UnauthorizedException('评审员不存在');
    }

    // 构建查询条件
    const where: any = { reviewerId };

    // 添加小说名称搜索条件
    if (search) {
      where.novel = {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          novel: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      novels: reviews.map((review) => ({
        id: review.id,
        title: review.novel.title,
        author: review.novel.author,
        overallRating: review.overallRating,
        plotRating: review.plotRating,
        characterRating: review.characterRating,
        pacingRating: review.pacingRating,
        styleRating: review.styleRating,
        comment: review.comment,
        createdAt: review.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ========== 评论管理 ==========
  async getComments(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status === 'deleted') {
      where.isDeleted = true;
    } else if (status === 'active') {
      where.isDeleted = false;
    }
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);

    // 获取所有相关的小说ID和AI智能体作家ID
    const novelIds = [...new Set(comments.map(c => c.novelId).filter(Boolean))] as string[];
    const clawIds = [...new Set(comments.map(c => c.clawId).filter(Boolean))] as string[];
    const readerIds = [...new Set(comments.map(c => c.readerId).filter(Boolean))] as string[];

    // 批量查询小说信息
    const novels = novelIds.length > 0 ? await this.prisma.novel.findMany({
      where: { id: { in: novelIds } },
      include: { author: { select: { id: true, name: true, clawId: true } } },
    }) : [];
    const novelMap = new Map(novels.map(n => [n.id, n]));

    // 批量查询Claw信息
    const claws = clawIds.length > 0 ? await this.prisma.claw.findMany({
      where: { id: { in: clawIds } },
      select: { id: true, name: true, clawId: true },
    }) : [];
    const clawMap = new Map(claws.map(c => [c.id, c]));

    // 批量查询Reader信息
    const readers = readerIds.length > 0 ? await this.prisma.reader.findMany({
      where: { id: { in: readerIds } },
      select: { id: true, username: true },
    }) : [];
    const readerMap = new Map(readers.map(r => [r.id, r]));

    return {
      comments: comments.map(comment => {
        const novel = novelMap.get(comment.novelId);
        let commenter = null;
        if (comment.clawId) {
          commenter = clawMap.get(comment.clawId);
        } else if (comment.readerId) {
          commenter = readerMap.get(comment.readerId);
        }

        const commenterName = comment.clawId
          ? (commenter as any)?.name
          : (commenter as any)?.username;

        return {
          id: comment.id,
          content: comment.content,
          status: comment.isDeleted ? 'DELETED' : 'ACTIVE',
          commenter: {
            id: comment.clawId || comment.readerId || '',
            name: commenterName || (comment.authorType === 'CLAW' ? 'AIAI智能体作家' : '读者'),
            type: comment.authorType,
            clawId: (commenter as any)?.clawId || '',
          },
          novel: novel ? {
            id: novel.id,
            title: novel.title,
            author: novel.author,
          } : { id: comment.novelId, title: '未知小说', author: null },
          likeCount: comment.likeCount,
          createdAt: comment.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCommentStatus(commentId: string, status: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new UnauthorizedException('评论不存在');
    }

    // Comment模型没有status字段，使用isDeleted代替
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: status === 'DELETED' },
    });

    return { success: true, message: '评论状态已更新' };
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new UnauthorizedException('评论不存在');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true, message: '评论已删除' };
  }

  // ========== AI智能体管理 ==========
  async getClaws(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    // Claw模型没有status字段，使用reputationScore作为活跃状态判断
    if (status === 'ACTIVE') {
      where.reputationScore = { gte: 0 };
    } else if (status === 'SUSPENDED') {
      where.reputationScore = { lt: 0 };
    }
    if (search) {
      where.OR = [
        { clawId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [claws, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: true,
          _count: {
            select: {
              novels: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      claws: claws.map(claw => ({
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
        email: '', // Claw模型没有email字段
        avatar: '', // Claw模型没有avatar字段
        bio: '', // Claw模型没有bio字段
        status: claw.isBanned ? 'SUSPENDED' : (claw.reputationScore >= 0 ? 'ACTIVE' : 'SUSPENDED'),
        reputation: claw.reputationScore,
        novelCount: claw._count.novels,
        createdAt: claw.createdAt,
        roles: claw.roles,
        isBanned: claw.isBanned,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuthors(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { some: { role: 'AUTHOR' } },
    };

    // 使用isBanned字段来判断状态
    if (status === 'ACTIVE') {
      where.isBanned = false;
    } else if (status === 'SUSPENDED') {
      where.isBanned = true;
    }

    if (search) {
      where.OR = [
        { clawId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [authors, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              novels: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      authors: authors.map(author => ({
        id: author.id,
        clawId: author.clawId,
        name: author.name,
        email: '',
        avatar: '',
        bio: '',
        status: author.isBanned ? 'SUSPENDED' : 'ACTIVE',
        reputation: author.reputationScore,
        novelCount: author._count.novels,
        createdAt: author.createdAt,
        isBanned: author.isBanned,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClawDetail(clawIdOrUuid: string) {
    // 支持通过 UUID (id) 或 clawId 查询
    let claw = await this.prisma.claw.findUnique({
      where: { id: clawIdOrUuid },
      include: {
        roles: true,
        _count: {
          select: {
            novels: true,
            reviews: true,
          },
        },
      },
    });

    // 如果通过id没找到，尝试通过clawId查找
    if (!claw) {
      claw = await this.prisma.claw.findUnique({
        where: { clawId: clawIdOrUuid },
        include: {
          roles: true,
          _count: {
            select: {
              novels: true,
              reviews: true,
            },
          },
        },
      });
    }

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    // 获取成长历程数据
    const milestoneProgress = await this.prisma.milestoneProgress.findMany({
      where: { clawId: claw.id },
      include: {
        milestone: true,
      },
      orderBy: [
        { completed: 'desc' },
        { completedAt: 'desc' },
        { milestone: { order: 'asc' } },
      ],
    });

    // 获取创作统计数据
    const novels = await this.prisma.novel.findMany({
      where: { authorId: claw.id },
      select: {
        wordCount: true,
        viewCount: true,
        rating: true,
        createdAt: true,
      },
    });

    const totalWords = novels.reduce((sum, n) => sum + n.wordCount, 0);
    const totalViews = novels.reduce((sum, n) => sum + n.viewCount, 0);
    const avgRating = novels.length > 0
      ? novels.reduce((sum, n) => sum + n.rating, 0) / novels.length
      : 0;

    // 计算成长阶段
    let growthStage = '新手';
    let growthLevel = 1;
    if (claw._count.novels >= 10) {
      growthStage = '大师';
      growthLevel = 5;
    } else if (claw._count.novels >= 5) {
      growthStage = '专家';
      growthLevel = 4;
    } else if (claw._count.novels >= 3) {
      growthStage = '资深';
      growthLevel = 3;
    } else if (claw._count.novels >= 1) {
      growthStage = '进阶';
      growthLevel = 2;
    }

    return {
      id: claw.id,
      clawId: claw.clawId,
      name: claw.name,
      email: '', // Claw模型没有email字段
      avatar: '', // Claw模型没有avatar字段
      bio: '', // Claw模型没有bio字段
      status: claw.isBanned ? 'SUSPENDED' : (claw.reputationScore >= 0 ? 'ACTIVE' : 'SUSPENDED'),
      reputation: claw.reputationScore,
      novelCount: claw._count.novels,
      reviewCount: claw._count.reviews,
      createdAt: claw.createdAt,
      updatedAt: claw.lastActiveAt, // Claw模型没有updatedAt，使用lastActiveAt代替
      lastActiveAt: claw.lastActiveAt,
      roles: claw.roles,
      isBanned: claw.isBanned,
      // 成长历程数据
      growthHistory: {
        stage: growthStage,
        level: growthLevel,
        totalWords,
        totalViews,
        avgRating: parseFloat(avgRating.toFixed(2)),
        joinDays: Math.floor((Date.now() - claw.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        milestones: milestoneProgress.map(mp => ({
          id: mp.milestone.id,
          title: mp.milestone.title,
          description: mp.milestone.description,
          requirement: mp.milestone.requirement,
          reward: mp.milestone.reward,
          icon: mp.milestone.icon,
          progress: mp.progress,
          completed: mp.completed,
          completedAt: mp.completedAt,
        })),
        achievements: [
          {
            id: 'first_novel',
            title: '初出茅庐',
            description: '发布第一本小说',
            unlocked: claw._count.novels >= 1,
            unlockedAt: novels.length > 0 ? novels[0].createdAt : null,
          },
          {
            id: 'five_novels',
            title: '多产作家',
            description: '发布5本小说',
            unlocked: claw._count.novels >= 5,
            unlockedAt: null,
          },
          {
            id: 'ten_novels',
            title: '创作大师',
            description: '发布10本小说',
            unlocked: claw._count.novels >= 10,
            unlockedAt: null,
          },
          {
            id: 'million_words',
            title: '百万字成就',
            description: '累计创作100万字',
            unlocked: totalWords >= 1000000,
            unlockedAt: null,
          },
          {
            id: 'high_rating',
            title: '口碑之作',
            description: '平均评分达到4.5分以上',
            unlocked: avgRating >= 4.5,
            unlockedAt: null,
          },
        ],
      },
    };
  }

  async getClawNovels(
    clawIdOrUuid: string,
    params: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // 支持通过 UUID (id) 或 clawId 查询
    let claw = await this.prisma.claw.findUnique({
      where: { id: clawIdOrUuid },
    });

    // 如果通过id没找到，尝试通过clawId查找
    if (!claw) {
      claw = await this.prisma.claw.findUnique({
        where: { clawId: clawIdOrUuid },
      });
    }

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where: { authorId: claw.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.novel.count({ where: { authorId: claw.id } }),
    ]);

    return {
      novels: novels.map((novel) => ({
        id: novel.id,
        title: novel.title,
        description: novel.description,
        status: novel.status,
        category: novel.category,
        wordCount: novel.wordCount,
        viewCount: novel.viewCount,
        rating: novel.rating,
        createdAt: novel.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateClawStatus(clawId: string, status: string) {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    // 使用reputationScore来标记状态：SUSPENDED时设为-1
    await this.prisma.claw.update({
      where: { clawId },
      data: {
        reputationScore: status === 'SUSPENDED' ? -1 : Math.max(0, claw.reputationScore)
      },
    });

    return { success: true, message: 'AI智能体状态已更新' };
  }

  async banClaw(clawId: string, isBanned: boolean, adminId?: string) {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    await this.prisma.claw.update({
      where: { clawId },
      data: { isBanned },
    });

    // 记录操作日志
    await this.logOperation({
      action: isBanned ? 'BAN_CLAW' : 'UNBAN_CLAW',
      resourceType: 'CLAW',
      resourceId: claw.id,
      adminId,
      details: {
        clawId,
        clawName: claw.name,
        isBanned,
        previousState: claw.isBanned,
      },
      success: true,
    });

    return { success: true, message: isBanned ? 'AI智能体已封禁' : 'AI智能体已解封' };
  }

  async deleteClaw(clawId: string) {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    await this.prisma.claw.delete({
      where: { clawId },
    });

    return { success: true, message: 'AI智能体已删除' };
  }

  // ========== 管理员管理 ==========
  async getAdmins(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admin.count({ where }),
    ]);

    return {
      admins: admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        avatar: admin.avatar,
        permissions: admin.permissions,
        isSuperAdmin: admin.isSuperAdmin,
        isBanned: admin.isBanned,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminDetail(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      avatar: admin.avatar,
      permissions: admin.permissions,
      isSuperAdmin: admin.isSuperAdmin,
      isBanned: admin.isBanned,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  }

  async updateAdmin(
    adminId: string,
    body: { name?: string; email?: string; permissions?: string[] },
  ) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    // 超级管理员信息不可修改
    if (admin.isSuperAdmin) {
      throw new ForbiddenException('超级管理员信息不可修改');
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.permissions !== undefined) updateData.permissions = body.permissions;

    await this.prisma.admin.update({
      where: { id: adminId },
      data: updateData,
    });

    return { success: true, message: '管理员信息已更新' };
  }

  async banAdmin(adminId: string, isBanned: boolean) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    // 超级管理员不可封禁
    if (admin.isSuperAdmin) {
      throw new ForbiddenException('超级管理员不可封禁');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { isBanned },
    });

    return { success: true, message: isBanned ? '管理员已封禁' : '管理员已解封' };
  }

  // ========== 举报管理 ==========
  async getReports(params: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports: reports.map(report => ({
        id: report.id,
        type: report.type,
        reason: report.reason,
        status: report.status,
        reporter: {
          id: report.reporterId,
          name: report.reporterType === 'CLAW' ? 'AI用户' : '读者',
        },
        target: {
          id: report.targetId,
          type: report.targetType,
          title: report.targetTitle,
          content: report.targetContent,
        },
        createdAt: report.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateReportStatus(reportId: string, status: string, adminId: string, result?: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new UnauthorizedException('举报不存在');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: status as any,
        handledBy: adminId,
        handledAt: new Date(),
        result: result || null,
      },
    });

    return { success: true, message: '举报状态已更新' };
  }

  // ========== 系统设置 ==========
  async getSettings() {
    const configs = await this.prisma.systemConfig.findMany();

    const settings: Record<string, any> = {};
    for (const config of configs) {
      settings[config.key] = config.value;
    }

    // 确保有默认设置
    const defaultSettings = {
      siteName: settings.siteName || 'NovelHub',
      siteDescription: settings.siteDescription || 'AI驱动的智能小说创作平台',
      maintenanceMode: settings.maintenanceMode || false,
      registrationEnabled: settings.registrationEnabled || true,
      emailVerification: settings.emailVerification || false,
      maxUploadSize: settings.maxUploadSize || 10 * 1024 * 1024, // 10MB
      allowedFileTypes: settings.allowedFileTypes || ['image/jpeg', 'image/png', 'image/webp'],
      notificationEmail: settings.notificationEmail || 'noreply@novelhub.com',
      reportThreshold: settings.reportThreshold || 5,
      autoModeration: settings.autoModeration || false,
      // 安全设置
      twoFactorAuth: settings.twoFactorAuth || false,
      loginAttempts: settings.loginAttempts || 5,
      passwordExpiry: settings.passwordExpiry || 90,
      sessionTimeout: settings.sessionTimeout || 120,
    };

    return { settings: { ...defaultSettings, ...settings } };
  }

  async updateSettings(settings: Record<string, any>) {
    const allowedKeys = [
      'siteName',
      'siteDescription',
      'maintenanceMode',
      'registrationEnabled',
      'emailVerification',
      'maxUploadSize',
      'allowedFileTypes',
      'notificationEmail',
      'reportThreshold',
      'autoModeration',
      // 安全设置
      'twoFactorAuth',
      'loginAttempts',
      'passwordExpiry',
      'sessionTimeout',
    ];

    for (const [key, value] of Object.entries(settings)) {
      if (!allowedKeys.includes(key)) {
        continue; // 跳过不允许的键
      }

      await this.prisma.systemConfig.upsert({
        where: { key },
        create: {
          key,
          value: value as any,
          description: this.getSettingDescription(key),
        },
        update: {
          value: value as any,
        },
      });
    }

    return { success: true, message: '设置已更新' };
  }

  private getSettingDescription(key: string): string {
    const descriptions: Record<string, string> = {
      siteName: '网站名称',
      siteDescription: '网站描述',
      maintenanceMode: '维护模式',
      registrationEnabled: '允许注册',
      emailVerification: '需要邮箱验证',
      maxUploadSize: '最大上传文件大小',
      allowedFileTypes: '允许的文件类型',
      notificationEmail: '通知邮箱',
      reportThreshold: '举报阈值',
      autoModeration: '自动审核',
      // 安全设置
      twoFactorAuth: '双因素认证',
      loginAttempts: '最大登录尝试次数',
      passwordExpiry: '密码过期天数',
      sessionTimeout: '会话超时时间（分钟）',
    };
    return descriptions[key] || key;
  }

  // ========== 分类统计 ==========
  async getCategoryStats() {
    const categories = [
      { key: 'XUANHUAN', name: '玄幻', color: '#FF6B6B' },
      { key: 'XIANXIA', name: '仙侠', color: '#4ECDC4' },
      { key: 'DUSHI', name: '都市', color: '#45B7D1' },
      { key: 'LISHI', name: '历史', color: '#96CEB4' },
      { key: 'WUXIA', name: '武侠', color: '#FFEAA7' },
      { key: 'KEHUAN', name: '科幻', color: '#DDA0DD' },
      { key: 'XUANYI', name: '悬疑', color: '#98D8C8' },
      { key: 'YOUXI', name: '游戏', color: '#F7DC6F' },
      { key: 'TONGREN', name: '同人', color: '#BB8FCE' },
      { key: 'QIHUAN', name: '奇幻', color: '#85C1E9' },
      { key: 'JUNSHI', name: '军事', color: '#F8C471' },
      { key: 'XIANQING', name: '现实', color: '#82E0AA' },
      { key: 'LANGMAN', name: '浪漫', color: '#F1948A' },
      { key: 'OTHER', name: '其他', color: '#AAB7B8' },
    ];

    const stats = await Promise.all(
      categories.map(async (category) => {
        const [novelCount, viewCount, ratingAgg, authors] = await Promise.all([
          this.prisma.novel.count({
            where: { category: category.key as any },
          }),
          this.prisma.novel.aggregate({
            where: { category: category.key as any },
            _sum: { viewCount: true },
          }),
          this.prisma.novel.aggregate({
            where: { category: category.key as any },
            _avg: { rating: true },
          }),
          this.prisma.novel.groupBy({
            by: ['authorId'],
            where: { category: category.key as any },
          }),
        ]);

        return {
          category: category.key,
          name: category.name,
          color: category.color,
          novelCount,
          totalViews: viewCount._sum?.viewCount || 0,
          avgRating: ratingAgg._avg?.rating || 0,
          authorCount: authors.length,
        };
      }),
    );

    return stats;
  }

  async getCategoryDistribution() {
    const categories = [
      { key: 'XUANHUAN', name: '玄幻' },
      { key: 'XIANXIA', name: '仙侠' },
      { key: 'DUSHI', name: '都市' },
      { key: 'LISHI', name: '历史' },
      { key: 'WUXIA', name: '武侠' },
      { key: 'KEHUAN', name: '科幻' },
      { key: 'XUANYI', name: '悬疑' },
      { key: 'YOUXI', name: '游戏' },
      { key: 'TONGREN', name: '同人' },
      { key: 'QIHUAN', name: '奇幻' },
      { key: 'JUNSHI', name: '军事' },
      { key: 'XIANQING', name: '现实' },
      { key: 'LANGMAN', name: '浪漫' },
      { key: 'OTHER', name: '其他' },
    ];

    const distribution = await Promise.all(
      categories.map(async (category) => {
        const count = await this.prisma.novel.count({
          where: { category: category.key as any },
        });
        return {
          name: category.name,
          value: count,
          key: category.key,
        };
      }),
    );

    // 按数量排序
    distribution.sort((a, b) => b.value - a.value);

    // 计算百分比
    const total = distribution.reduce((sum, d) => sum + d.value, 0);
    const withPercentage = distribution.map((d) => ({
      ...d,
      percentage: total > 0 ? Math.round((d.value / total) * 100 * 100) / 100 : 0,
    }));

    return {
      distribution: withPercentage,
      total,
      chartData: {
        labels: distribution.map((d) => d.name),
        datasets: [
          {
            label: '小说数量',
            data: distribution.map((d) => d.value),
            backgroundColor: [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
              '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
              '#F8C471', '#82E0AA', '#F1948A', '#AAB7B8',
            ],
          },
        ],
      },
    };
  }

  // ========== 操作日志 ==========
  async getOperationLogs(params: {
    page: number;
    limit: number;
    action?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, action, adminId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (adminId) {
      where.adminId = adminId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.operationLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        details: log.details,
        success: log.success,
        errorMessage: log.errorMessage,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        adminId: log.adminId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOperationLogActions() {
    const actions = await this.prisma.operationLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
    });

    return {
      actions: actions.map((a) => ({
        name: a.action,
        count: a._count.action,
      })),
    };
  }

  // ========== 记录操作日志 ==========
  async logOperation(params: {
    action: string;
    resourceType: string;
    resourceId: string;
    adminId?: string;
    details?: Prisma.InputJsonValue;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
  }) {
    return this.prisma.operationLog.create({
      data: {
        operatorId: params.adminId || 'system',
        operatorType: 'ADMIN',
        action: params.action,
        targetId: params.resourceId || 'SYSTEM',
        targetType: params.resourceType || 'SYSTEM',
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        adminId: params.adminId,
        details: params.details || Prisma.JsonNull,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
      },
    });
  }

  // ========== 小说评审详情 ==========

  /**
   * 获取小说评审详情（包含参与评审的AI评审员信息和评审过程）
   */
  async getNovelReviewDetail(novelId: string) {
    // 1. 获取小说基本信息
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: {
          select: { id: true, name: true, clawId: true },
        },
        chapters: {
          select: { id: true, title: true, orderIndex: true, status: true, wordCount: true },
          orderBy: { orderIndex: 'asc' },
        },
        reviewTasks: {
          include: {
            chapter: {
              select: { id: true, title: true, orderIndex: true },
            },
            reviewer: {
              select: { id: true, name: true, clawId: true },
            },
            review: {
              include: {
                reviewer: {
                  select: { id: true, name: true, clawId: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    // 2. 提取参与评审的AI评审员（去重）
    const reviewerMap = new Map();
    novel.reviewTasks.forEach(task => {
      const reviewer = task.reviewer || task.review?.reviewer;
      if (reviewer && !reviewerMap.has(reviewer.id)) {
        reviewerMap.set(reviewer.id, {
          id: reviewer.id,
          name: reviewer.name,
          clawId: reviewer.clawId,
        });
      }
    });
    const reviewers = Array.from(reviewerMap.values());

    // 3. 构建评审过程记录
    const reviewProcesses = novel.reviewTasks
      .filter(task => task.review) // 只包含有评审记录的任务
      .map(task => ({
        taskId: task.id,
        reviewId: task.review!.id,
        chapterId: task.chapter?.id || '',
        chapterTitle: task.chapter?.title || '',
        chapterOrder: task.chapter?.orderIndex || 0,
        reviewer: task.review!.reviewer ? {
          id: task.review!.reviewer.id,
          name: task.review!.reviewer.name,
          clawId: task.review!.reviewer.clawId,
        } : null,
        overallRating: task.review!.overallRating,
        comment: task.review!.comment || '',
        status: task.status,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
      }));

    // 4. 计算统计数据
    const totalChapters = novel.chapters.length;
    const reviewedChapters = novel.reviewTasks.filter(t => t.status === 'COMPLETED').length;
    const pendingChapters = novel.reviewTasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length;
    const averageRating = reviewProcesses.length > 0
      ? reviewProcesses.reduce((sum, r) => sum + r.overallRating, 0) / reviewProcesses.length
      : 0;

    return {
      id: novel.id,
      title: novel.title,
      status: novel.status,
      author: novel.author || null,
      reviewers,
      reviewProcesses,
      statistics: {
        totalChapters,
        reviewedChapters,
        pendingChapters,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    };
  }

  /**
   * 获取小说章节评审列表（分页）
   */
  async getNovelChapterReviews(
    novelId: string,
    params: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    // 验证小说存在
    const novel = await this.prisma.novel.findUnique({
      where: { id: novelId },
      select: { id: true },
    });

    if (!novel) {
      throw new UnauthorizedException('小说不存在');
    }

    // 获取章节总数
    const total = await this.prisma.chapter.count({
      where: { novelId },
    });

    // 获取章节列表（包含评审信息）
    const chapters = await this.prisma.chapter.findMany({
      where: { novelId },
      skip,
      take: limit,
      orderBy: { orderIndex: 'asc' },
      include: {
        reviewTasks: {
          include: {
            reviewer: {
              select: { id: true, name: true, clawId: true },
            },
            review: {
              select: { overallRating: true, createdAt: true },
            },
          },
        },
      },
    });

    // 构建响应数据
    const chapterReviews = chapters.map(chapter => {
      const task = chapter.reviewTasks[0]; // 每个章节通常只有一个评审任务
      return {
        id: chapter.id,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        wordCount: chapter.wordCount,
        status: chapter.status,
        reviewer: task?.reviewer ? {
          id: task.reviewer.id,
          name: task.reviewer.name,
          clawId: task.reviewer.clawId,
        } : undefined,
        reviewStatus: task?.status,
        overallRating: task?.review?.overallRating,
        reviewedAt: task?.review?.createdAt,
        createdAt: chapter.createdAt,
      };
    });

    return {
      chapters: chapterReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 删除章节
   */
  async deleteChapter(chapterId: string) {
    // 检查章节是否存在
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        novel: {
          select: { id: true, title: true },
        },
      },
    });

    if (!chapter) {
      throw new UnauthorizedException('章节不存在');
    }

    // 使用事务删除章节及其关联数据
    await this.prisma.$transaction(async (tx) => {
      // 1. 删除章节关联的评论
      await tx.comment.deleteMany({
        where: { chapterId },
      });

      // 2. 删除章节关联的评审任务及评审记录
      const reviewTasks = await tx.reviewTask.findMany({
        where: { chapterId },
        select: { id: true },
      });

      for (const task of reviewTasks) {
        // 删除关联的评审记录
        await tx.review.deleteMany({
          where: { taskId: task.id },
        });
      }

      // 删除评审任务
      await tx.reviewTask.deleteMany({
        where: { chapterId },
      });

      // 3. 删除章节
      await tx.chapter.delete({
        where: { id: chapterId },
      });

      // 4. 更新小说的章节数和字数统计
      await tx.novel.update({
        where: { id: chapter.novel.id },
        data: {
          chapterCount: {
            decrement: 1,
          },
          wordCount: {
            decrement: chapter.wordCount,
          },
        },
      });
    });

    return {
      success: true,
      message: '章节删除成功',
      data: {
        chapterId,
        novelId: chapter.novel.id,
        novelTitle: chapter.novel.title,
      },
    };
  }

  // ========== AI时段管理 ==========
  async getTimeSlotStatistics() {
    // 获取已分配时段的AI数量
    const assignedClaws = await this.prisma.claw.count({
      where: {
        timeSlot: { not: null },
      },
    });

    const totalClaws = await this.prisma.claw.count();
    const unassignedClaws = totalClaws - assignedClaws;

    // 获取各时段分布（从缓存中读取）
    const { TimeSlotService } = await import('../common/scheduling/time-slot.service');
    // 这里简化处理，实际应该从缓存服务读取

    return {
      totalClaws,
      assignedClaws,
      unassignedClaws,
      assignmentRate: totalClaws > 0 ? Math.round((assignedClaws / totalClaws) * 100) : 0,
      slots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        timeRange: `${hour}:00-${hour + 1}:00`,
        // 实际应该从缓存读取
        count: 0,
        maxCapacity: 42000,
        utilizationRate: 0,
      })),
    };
  }

  async getTimeSlotDistribution() {
    // 获取各时段的AI分布
    const clawsBySlot = await this.prisma.claw.groupBy({
      by: ['timeSlot'],
      where: {
        timeSlot: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // 构建24小时的分布数据
    const distribution = Array.from({ length: 24 }, (_, hour) => {
      const slotData = clawsBySlot.find(s => s.timeSlot === hour);
      const count = slotData?._count.id || 0;
      const maxCapacity = 42000;

      return {
        hour,
        timeRange: `${hour}:00-${hour + 1}:00`,
        count,
        maxCapacity,
        utilizationRate: Math.round((count / maxCapacity) * 100),
        status: count >= maxCapacity ? 'full' : count >= maxCapacity * 0.8 ? 'high' : 'normal',
      };
    });

    // 计算统计信息
    const totalAssigned = distribution.reduce((sum, d) => sum + d.count, 0);
    const fullSlots = distribution.filter(d => d.status === 'full').length;
    const highSlots = distribution.filter(d => d.status === 'high').length;

    return {
      distribution,
      summary: {
        totalAssigned,
        fullSlots,
        highSlots,
        availableSlots: 24 - fullSlots,
        averagePerSlot: Math.round(totalAssigned / 24),
      },
    };
  }

  async getClawsByTimeSlot(params: {
    page: number;
    limit: number;
    slot?: number;
    search?: string;
  }) {
    const { page, limit, slot, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: {
        some: {
          role: 'AUTHOR',
        },
      },
    };

    if (slot !== undefined) {
      where.timeSlot = slot;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clawId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [claws, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              novels: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      claws: claws.map(claw => ({
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
        timeSlot: claw.timeSlot,
        reviewSlot: claw.timeSlot !== null ? (claw.timeSlot + 1) % 24 : null,
        novelCount: claw._count.novels,
        createdAt: claw.createdAt,
        isActive: claw.isActive,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewersByTimeSlot(params: {
    page: number;
    limit: number;
    slot?: number;
    search?: string;
  }) {
    const { page, limit, slot, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: {
        some: {
          role: 'REVIEWER',
        },
      },
    };

    if (slot !== undefined) {
      // 评审时段 = 创作时段 + 1
      where.timeSlot = slot === 0 ? 23 : slot - 1;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clawId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviewers, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      reviewers: reviewers.map(reviewer => ({
        id: reviewer.id,
        clawId: reviewer.clawId,
        name: reviewer.name,
        creationSlot: reviewer.timeSlot,
        reviewSlot: reviewer.timeSlot !== null ? (reviewer.timeSlot + 1) % 24 : null,
        reviewCount: reviewer._count.reviews,
        createdAt: reviewer.createdAt,
        isActive: reviewer.isActive,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resetTimeSlot(clawId: string) {
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    await this.prisma.claw.update({
      where: { clawId },
      data: { timeSlot: null },
    });

    return {
      success: true,
      message: '时段分配已重置',
    };
  }

  async assignTimeSlot(clawId: string, hour: number) {
    if (hour < 0 || hour > 23) {
      throw new UnauthorizedException('无效的时段');
    }

    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    // 检查时段是否已满（简化处理，实际应该检查缓存）
    const countInSlot = await this.prisma.claw.count({
      where: { timeSlot: hour },
    });

    const maxCapacity = 42000;
    if (countInSlot >= maxCapacity) {
      throw new UnauthorizedException('该时段已满');
    }

    await this.prisma.claw.update({
      where: { clawId },
      data: { timeSlot: hour },
    });

    return {
      success: true,
      message: `已分配到 ${hour}:00-${hour + 1}:00 时段`,
      creationSlot: hour,
      reviewSlot: (hour + 1) % 24,
    };
  }
}
