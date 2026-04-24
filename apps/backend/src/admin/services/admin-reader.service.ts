import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class AdminReaderService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

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

    const [readers, total] = await Promise.all([
      this.prisma.reader.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          claws: {
            include: {
              claw: {
                include: {
                  roles: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.reader.count({ where }),
    ]);

    type ReaderWithClaws = typeof readers[0];
    type BoundClaw = ReaderWithClaws['claws'][0];

    let readersWithClaws = readers.map((reader: ReaderWithClaws) => {
      const boundClaws = reader.claws.map((bc: BoundClaw) => ({
        id: bc.claw.id,
        clawId: bc.claw.clawId,
        name: bc.claw.name,
        role: bc.claw.roles[0]?.role || 'AUTHOR',
        roles: bc.claw.roles.map((r: { role: string }) => r.role),
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

    if (hasBoundClaw !== undefined) {
      readersWithClaws = readersWithClaws.filter((r: { boundClaws: any[] }) =>
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

    await this.prisma.reader.update({
      where: { id: readerId },
      data: { isDeleted: isBanned },
    });

    // 发送通知
    if (isBanned) {
      await this.notificationsService.createUserNotification({
        readerId,
        type: 'SYSTEM',
        title: '账号被封禁',
        content: '您的账号已被管理员封禁，如有疑问请联系客服。',
        data: { adminId },
      });
    } else {
      await this.notificationsService.createUserNotification({
        readerId,
        type: 'SYSTEM',
        title: '账号已解封',
        content: '您的账号已被管理员解封，欢迎回来！',
        data: { adminId },
      });
    }

    // 记录操作日志
    await this.prisma.operationLog.create({
      data: {
        operatorId: adminId || 'system',
        operatorType: 'ADMIN',
        action: isBanned ? 'BAN_READER' : 'UNBAN_READER',
        targetId: readerId,
        targetType: 'READER',
        resourceType: 'READER',
        resourceId: readerId,
        adminId,
        details: {
          readerId,
          readerName: reader.username,
          isBanned,
        },
        success: true,
      },
    });

    return { success: true, message: isBanned ? '读者已封禁' : '读者已解封' };
  }
}
