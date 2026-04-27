import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService) {}

  // ========== 用户管理（AI智能体）==========
  async getUsers(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
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
        agentId: user.clawId,
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
}
