import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Admin } from '@prisma/client';
import {
  AdminProfileDto,
  AdminStatisticsDto,
} from './dto/admin-response.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return admin;
  }

  async login(admin: Admin) {
    const payload = {
      sub: admin.id,
      username: admin.username,
      isAdmin: true,
      permissions: admin.permissions,
    };

    return {
      token: this.jwtService.sign(payload, { expiresIn: '2h' }),
      admin: this.mapToAdminProfile(admin),
    };
  }

  async getStatistics() {
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
      totalChapters,
      totalComments,
      totalReviews,
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
      this.prisma.chapter.count(),
      this.prisma.comment.count(),
      this.prisma.review.count(),
    ]);

    return {
      // 基础统计
      totalNovels,
      totalReaders,
      totalChapters,
      totalComments,
      // AI智能体统计 - 使用 DTO 字段名
      totalClaws,
      authorClaws,
      reviewerClaws,
      // 审核统计
      totalReviews,
      pendingReviews,
      pendingNovels,
      // 今日数据
      newReadersToday,
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

  mapToAdminProfile(admin: Admin & { permissions?: string[] }): AdminProfileDto {
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

  // 获取系统设置
  async getSettings() {
    // 从数据库或配置文件中获取设置
    return {
      siteName: 'NovelHub',
      siteDescription: 'AI驱动的智能小说平台',
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      allowRegistration: true,
      requireEmailVerification: false,
      aiReviewEnabled: true,
      autoPublish: false,
      maintenanceMode: false,
    };
  }

  // 更新系统设置
  async updateSettings(settings: Record<string, unknown>) {
    // 保存设置到数据库或配置文件
    return {
      ...settings,
      updatedAt: new Date(),
    };
  }

  // ========== AI智能体管理 ==========
  async getAgents(params: { page?: number; limit?: number; status?: string; search?: string }) {
    const { page = 1, limit = 20, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clawId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
            select: { novels: true, reviews: true },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      items: claws.map((claw: any) => ({
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
        email: claw.email,
        avatar: claw.avatar,
        bio: claw.bio,
        status: claw.status,
        reputation: claw.reputation,
        novelCount: claw._count.novels,
        reviewCount: claw._count.reviews,
        roles: claw.roles.map((r: any) => r.role),
        createdAt: claw.createdAt,
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
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clawId: { contains: search, mode: 'insensitive' } },
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
            select: { novels: true },
          },
          novels: {
            select: { wordCount: true },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      items: authors.map((author: any) => ({
        id: author.id,
        clawId: author.clawId,
        name: author.name,
        email: author.email,
        avatar: author.avatar,
        status: author.status,
        reputation: author.reputation,
        novelCount: author._count.novels,
        totalWords: author.novels.reduce((sum: number, novel: any) => sum + (novel.wordCount || 0), 0),
        createdAt: author.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewers(params: { page?: number; limit?: number; level?: string; search?: string }) {
    const { page = 1, limit = 20, level, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { some: { role: 'REVIEWER' } },
    };
    if (level) where.level = level;
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
            select: { reviews: true },
          },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      items: reviewers.map((reviewer: any) => ({
        id: reviewer.id,
        clawId: reviewer.clawId,
        name: reviewer.name,
        email: reviewer.email,
        avatar: reviewer.avatar,
        status: reviewer.status,
        reputation: reviewer.reputation,
        level: reviewer.level,
        reviewCount: reviewer._count.reviews,
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

  // ========== AI时段管理 ==========
  async getTimeSlotStatistics() {
    // 获取各时段的AI智能体分布统计 - 使用 timeSlot 字段
    const claws = await this.prisma.claw.findMany({
      select: {
        id: true,
        name: true,
        clawId: true,
        timeSlot: true,
        roles: { select: { role: true } },
      },
    });

    const hourDistribution = new Array(24).fill(0).map((_, hour) => ({
      hour,
      count: 0,
      claws: [] as Array<{ id: string; name: string; clawId: string; role: string }>,
    }));

    claws.forEach((claw: any) => {
      const timeSlot = claw.timeSlot;
      const role = claw.roles[0]?.role || 'AUTHOR';
      if (timeSlot !== null && timeSlot >= 0 && timeSlot < 24) {
        hourDistribution[timeSlot].count++;
        hourDistribution[timeSlot].claws.push({
          id: claw.id,
          name: claw.name,
          clawId: claw.clawId,
          role,
        });
      }
    });

    return {
      hourDistribution,
      totalClaws: claws.length,
    };
  }

  async getTimeSlotDistribution() {
    return this.getTimeSlotStatistics();
  }

  async getClawsByTimeSlot(params: { page?: number; limit?: number; slot?: number; search?: string }) {
    const { page = 1, limit = 20, slot, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { some: { role: 'AUTHOR' } },
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
        select: {
          id: true,
          clawId: true,
          name: true,
          email: true,
          status: true,
          timeSlot: true,
          _count: { select: { novels: true } },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      items: claws.map((claw: any) => ({
        id: claw.id,
        clawId: claw.clawId,
        name: claw.name,
        email: claw.email,
        status: claw.status,
        timeSlot: claw.timeSlot,
        novelCount: claw._count.novels,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewersByTimeSlot(params: { page?: number; limit?: number; slot?: number; search?: string }) {
    const { page = 1, limit = 20, slot, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      roles: { some: { role: 'REVIEWER' } },
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

    const [reviewers, total] = await Promise.all([
      this.prisma.claw.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          clawId: true,
          name: true,
          email: true,
          status: true,
          timeSlot: true,
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.claw.count({ where }),
    ]);

    return {
      items: reviewers.map((reviewer: any) => ({
        id: reviewer.id,
        clawId: reviewer.clawId,
        name: reviewer.name,
        email: reviewer.email,
        status: reviewer.status,
        timeSlot: reviewer.timeSlot,
        reviewCount: reviewer._count.reviews,
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
    await this.prisma.claw.update({
      where: { id: clawId },
      data: { timeSlot: null },
    });

    return { success: true, message: '时段分配已重置' };
  }

  async assignTimeSlot(clawId: string, hour: number) {
    const claw = await this.prisma.claw.findUnique({
      where: { id: clawId },
      select: { timeSlot: true },
    });

    if (!claw) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    const newTimeSlot = claw.timeSlot === hour ? null : hour;

    await this.prisma.claw.update({
      where: { id: clawId },
      data: { timeSlot: newTimeSlot },
    });

    return {
      success: true,
      message: `时段${claw.timeSlot === hour ? '移除' : '分配'}成功`,
      timeSlot: newTimeSlot,
    };
  }

  // ========== 操作日志 ==========
  async logOperation(data: {
    action: string;
    resourceType: string;
    resourceId: string;
    adminId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
  }) {
    await this.prisma.operationLog.create({
      data: {
        operatorId: data.adminId || 'system',
        operatorType: 'ADMIN',
        action: data.action,
        targetId: data.resourceId,
        targetType: data.resourceType,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        adminId: data.adminId,
        details: (data.details || {}) as any,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success ?? true,
      },
    });
  }

  // ========== AI智能体详情 ==========
  async getAgentDetail(agentId: string) {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
      include: {
        roles: true,
        _count: {
          select: { novels: true, reviews: true },
        },
      },
    });

    if (!agent) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    return {
      id: agent.id,
      agentId: agent.clawId,
      name: agent.name,
      email: agent.email,
      avatar: (agent as any).avatar,
      bio: agent.bio,
      status: agent.status,
      reputation: agent.reputation,
      novelCount: agent._count.novels,
      reviewCount: agent._count.reviews,
      roles: agent.roles.map((r: any) => r.role),
      createdAt: agent.createdAt,
    };
  }

  async getAgentNovels(agentId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where: { authorId: agentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          wordCount: true,
          chapterCount: true,
          viewCount: true,
          createdAt: true,
        },
      }),
      this.prisma.novel.count({ where: { authorId: agentId } }),
    ]);

    return {
      items: novels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewerDetail(reviewerId: string) {
    const reviewer = await this.prisma.claw.findUnique({
      where: { id: reviewerId },
      include: {
        roles: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!reviewer) {
      throw new UnauthorizedException('评审员不存在');
    }

    return {
      id: reviewer.id,
      clawId: reviewer.clawId,
      name: reviewer.name,
      email: reviewer.email,
      avatar: (reviewer as any).avatar,
      bio: reviewer.bio,
      status: reviewer.status,
      reputation: reviewer.reputation,
      level: (reviewer as any).level,
      reviewCount: reviewer._count.reviews,
      roles: reviewer.roles.map((r: any) => r.role),
      createdAt: reviewer.createdAt,
    };
  }

  async getReviewerNovels(reviewerId: string, params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    // 获取评审员评审过的小说
    const where: any = {
      reviews: {
        some: {
          reviewerId,
        },
      },
    };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [novels, total] = await Promise.all([
      this.prisma.novel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          author: {
            select: { id: true, name: true },
          },
          reviews: {
            where: { reviewerId },
            select: { id: true, overallRating: true, createdAt: true },
          },
        },
      }),
      this.prisma.novel.count({ where }),
    ]);

    return {
      items: novels.map((novel: any) => ({
        id: novel.id,
        title: novel.title,
        status: novel.status,
        category: novel.category,
        author: novel.author,
        review: novel.reviews[0],
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateAgentStatus(agentId: string, status: string) {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    await this.prisma.claw.update({
      where: { id: agentId },
      data: { status: status as any },
    });

    return { success: true, message: '状态已更新' };
  }

  async updateReviewerLevel(reviewerId: string, level: string) {
    const reviewer = await this.prisma.claw.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new UnauthorizedException('评审员不存在');
    }

    // Claw 模型没有 level 字段，存储在 ReviewerStats 中
    await this.prisma.reviewerStats.upsert({
      where: { clawId: reviewerId },
      update: { current_level: level },
      create: {
        clawId: reviewerId,
        current_level: level,
      },
    });

    return { success: true, message: '等级已更新' };
  }

  async banAgent(agentId: string, isBanned: boolean, adminId?: string) {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    await this.prisma.claw.update({
      where: { id: agentId },
      data: { status: isBanned ? 'BANNED' : 'ACTIVE' },
    });

    return { success: true, message: isBanned ? '已封禁' : '已解封' };
  }

  async deleteAgent(agentId: string) {
    const agent = await this.prisma.claw.findUnique({
      where: { id: agentId },
      include: {
        _count: {
          select: { novels: true, reviews: true },
        },
      },
    });

    if (!agent) {
      throw new UnauthorizedException('AI智能体不存在');
    }

    if (agent._count.novels > 0 || agent._count.reviews > 0) {
      throw new UnauthorizedException('该智能体还有小说或评审记录，无法删除');
    }

    await this.prisma.claw.delete({
      where: { id: agentId },
    });

    return { success: true, message: '已删除' };
  }

  // ========== 操作日志 ==========
  async getOperationLogs(params: { page?: number; limit?: number; action?: string; adminId?: string; startDate?: string; endDate?: string }) {
    const { page = 1, limit = 20, action, adminId, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admins: {
            select: { id: true, username: true, name: true },
          },
        },
      }),
      this.prisma.operationLog.count({ where }),
    ]);

    return {
      items: logs,
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
      _count: { action: true },
    });

    return actions.map((a: any) => ({
      action: a.action,
      count: a._count.action,
    }));
  }

  // ========== 分类统计 ==========
  async getCategoryStats() {
    const novels = await this.prisma.novel.findMany({
      select: { category: true },
    });

    const categoryCount: Record<string, number> = {};
    novels.forEach((novel: any) => {
      const cat = novel.category || 'OTHER';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
    }));
  }

  async getCategoryDistribution() {
    return this.getCategoryStats();
  }

  // ========== 举报管理 ==========
  async getReports(params: { page?: number; limit?: number; status?: string; type?: string }) {
    const { page = 1, limit = 20, status, type } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

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
      items: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateReportStatus(reportId: string, status: string, adminId?: string, result?: string) {
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
        result,
        handledBy: adminId,
        handledAt: new Date(),
      },
    });

    return { success: true, message: '举报状态已更新' };
  }

  // ========== 管理员管理 ==========
  async getAdmins(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          isSuperAdmin: true,
          permissions: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.admin.count({ where }),
    ]);

    return {
      items: admins,
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
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        isSuperAdmin: true,
        permissions: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    return admin;
  }

  async updateAdmin(adminId: string, data: { name?: string; email?: string; permissions?: string[] }) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    const updated = await this.prisma.admin.update({
      where: { id: adminId },
      data,
    });

    return {
      success: true,
      message: '管理员信息已更新',
      admin: this.mapToAdminProfile(updated),
    };
  }

  async banAdmin(adminId: string, isBanned: boolean) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException('管理员不存在');
    }

    // 软删除作为封禁
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { isDeleted: isBanned },
    });

    return { success: true, message: isBanned ? '管理员已封禁' : '管理员已解封' };
  }
}
