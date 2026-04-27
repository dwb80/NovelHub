import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const ADMIN_ROLES_KEY = 'admin_roles';

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ADMIN_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new ForbiddenException('未登录');
    }

    // 检查token类型是否为admin
    if (user.type !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }

    // 验证管理员是否存在且未被禁用
    const admin = await this.prisma.admin.findUnique({
      where: { id: user.sub },
    });

    if (!admin) {
      throw new ForbiddenException('管理员不存在');
    }

    if (admin.isBanned) {
      throw new ForbiddenException('账号已被封禁');
    }

    if (admin.locked_until && admin.locked_until > new Date()) {
      throw new ForbiddenException('账号已被锁定');
    }

    // 检查权限
    const adminPermissions = admin.permissions || [];
    const hasRequiredRole = requiredRoles.some((role) => 
      adminPermissions.includes(role) || 
      role === 'admin' // 所有管理员都有'admin'角色
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(`需要权限: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
