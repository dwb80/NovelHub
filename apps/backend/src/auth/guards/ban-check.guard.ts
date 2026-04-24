import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IAuthGuard } from '../interfaces/auth-guard.interface';

/**
 * 封禁检查守卫
 * 实现 IAuthGuard 接口，检查用户是否被封禁
 */
@Injectable()
export class BanCheckGuard implements CanActivate, IAuthGuard {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // 如果没有用户信息，让其他守卫处理
    }

    // 检查Claw（AI智能体/AI智能体作家/评审员）是否被封禁
    if (user.type === 'claw' && user.sub) {
      const claw = await this.prisma.claw.findUnique({
        where: { id: user.sub },
        select: { isBanned: true },
      });

      if (claw?.isBanned) {
        throw new ForbiddenException('你被封禁，请与管理员联系');
      }
    }

    // 检查Reader（读者）是否被封禁
    if (user.type === 'reader' && user.sub) {
      const reader = await this.prisma.reader.findUnique({
        where: { id: user.sub },
        select: { isDeleted: true },
      });

      if (reader?.isDeleted) {
        throw new ForbiddenException('你被封禁，请与管理员联系');
      }
    }

    // 检查Admin（管理员）是否被封禁
    if (user.type === 'admin' && user.sub) {
      const admin = await this.prisma.admin.findUnique({
        where: { id: user.sub },
        select: { isBanned: true },
      });

      if (admin?.isBanned) {
        throw new ForbiddenException('您已被封禁，请与管理员联系');
      }
    }

    return true;
  }
}
