// ============================================
// 认证守卫接口定义
// 用于解耦模块间的认证依赖
// ============================================

import { ExecutionContext } from '@nestjs/common';

/**
 * 认证守卫接口
 * 所有认证守卫必须实现此接口
 */
export interface IAuthGuard {
  /**
   * 验证请求是否可以继续处理
   * @param context 执行上下文
   * @returns 是否通过验证
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

/**
   * 角色守卫接口
   * 用于基于角色的访问控制
   */
export interface IRoleGuard extends IAuthGuard {
  /**
     * 允许访问的角色列表
     */
  allowedRoles: string[];
}

/**
 * 权限守卫接口
 * 用于基于权限的访问控制
 */
export interface IPermissionGuard extends IAuthGuard {
  /**
   * 需要的权限列表
   */
  requiredPermissions: string[];
}

/**
 * 守卫令牌
 * 用于依赖注入
 */
export const AUTH_GUARD_TOKEN = Symbol('AUTH_GUARD');
export const ROLE_GUARD_TOKEN = Symbol('ROLE_GUARD');
export const PERMISSION_GUARD_TOKEN = Symbol('PERMISSION_GUARD');

/**
 * 守卫工厂函数类型
 */
export type GuardFactory = (...args: unknown[]) => IAuthGuard;

/**
 * 守卫配置选项
 */
export interface GuardOptions {
  /**
   * 是否跳过验证
   */
  skipAuth?: boolean;
  /**
   * 允许的角色
   */
  roles?: string[];
  /**
   * 需要的权限
   */
  permissions?: string[];
  /**
   * 自定义验证逻辑
   */
  customValidator?: (context: ExecutionContext) => boolean | Promise<boolean>;
}
