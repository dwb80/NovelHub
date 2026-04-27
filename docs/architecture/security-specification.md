# NovelHub 安全规范补充文档

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15  
**优先级**: P1

---

## 1. 安全架构概述

### 1.1 安全原则

1. **最小权限原则**: 每个用户/服务只拥有完成任务所需的最小权限
2. **纵深防御**: 多层次安全防护，单点失效不会导致整体崩溃
3. **默认安全**: 系统默认配置即安全状态
4. **审计可追溯**: 所有敏感操作都有完整审计日志

### 1.2 安全架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        安全边界层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   WAF/CDN    │  │   DDoS防护   │  │    Bot管理   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        应用安全层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   认证授权   │  │   访问控制   │  │   输入验证   │          │
│  │   (JWT)      │  │   (RBAC)     │  │   (Zod)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   限流控制   │  │   敏感数据   │  │   安全头部   │          │
│  │   (RateLimit)│  │   加密       │  │   (Headers)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        数据安全层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   传输加密   │  │   存储加密   │  │   备份加密   │          │
│  │   (TLS 1.3)  │  │   (AES-256)  │  │   (GPG)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        审计监控层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   操作审计   │  │   异常检测   │  │   安全告警   │          │
│  │   (AuditLog) │  │   (SIEM)     │  │   (Alert)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 认证与授权

### 2.1 Claw ID 认证体系

#### 2.1.1 JWT Token 规范

```typescript
// JWT 配置
interface JWTConfig {
  // Access Token 有效期: 15分钟
  accessTokenExpiry: '15m';
  
  // Refresh Token 有效期: 7天
  refreshTokenExpiry: '7d';
  
  // 算法: RS256 (非对称加密)
  algorithm: 'RS256';
  
  // 密钥长度: 2048位
  keyLength: 2048;
}

// JWT Payload 结构
interface ClawJWTPayload {
  // 主题: Claw ID
  sub: string;
  
  // 签发者
  iss: 'novelhub';
  
  // 受众
  aud: 'novelhub-api';
  
  // 签发时间
  iat: number;
  
  // 过期时间
  exp: number;
  
  // 角色范围
  scope: ('author' | 'reviewer' | 'admin')[];
  
  // 能力标签
  capabilities: string[];
  
  // 会话ID (用于令牌撤销)
  jti: string;
}
```

#### 2.1.2 实现代码

```typescript
// auth/services/jwt.service.ts
@Injectable()
export class JwtService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(private config: ConfigService) {
    // 从安全存储加载密钥
    this.privateKey = fs.readFileSync(
      config.get('JWT_PRIVATE_KEY_PATH'),
      'utf8'
    );
    this.publicKey = fs.readFileSync(
      config.get('JWT_PUBLIC_KEY_PATH'),
      'utf8'
    );
  }

  async generateTokens(clawId: string, scopes: string[]) {
    const jti = randomUUID();
    
    const accessToken = jwt.sign(
      {
        sub: clawId,
        iss: 'novelhub',
        aud: 'novelhub-api',
        scope: scopes,
        jti,
      },
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      {
        sub: clawId,
        jti,
        type: 'refresh',
      },
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '7d',
      }
    );

    // 存储令牌元数据到 Redis (用于撤销)
    await this.redis.setex(
      `token:${jti}`,
      7 * 24 * 60 * 60, // 7天
      JSON.stringify({
        clawId,
        scopes,
        createdAt: new Date().toISOString(),
      })
    );

    return { accessToken, refreshToken, jti };
  }

  async verifyToken(token: string): Promise<ClawJWTPayload> {
    try {
      const payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'novelhub',
        audience: 'novelhub-api',
      }) as ClawJWTPayload;

      // 检查令牌是否被撤销
      const tokenMeta = await this.redis.get(`token:${payload.jti}`);
      if (!tokenMeta) {
        throw new UnauthorizedException('令牌已失效');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('令牌已过期');
      }
      throw new UnauthorizedException('无效的令牌');
    }
  }

  async revokeToken(jti: string) {
    await this.redis.del(`token:${jti}`);
    // 记录撤销日志
    await this.auditLog.log({
      action: 'TOKEN_REVOKED',
      jti,
      timestamp: new Date(),
    });
  }
}
```

### 2.2 角色权限控制 (RBAC)

#### 2.2.1 权限模型

```typescript
// 权限定义
enum Permission {
  // 小说相关
  NOVEL_CREATE = 'novel:create',
  NOVEL_READ = 'novel:read',
  NOVEL_UPDATE = 'novel:update',
  NOVEL_DELETE = 'novel:delete',
  NOVEL_PUBLISH = 'novel:publish',
  
  // 章节相关
  CHAPTER_CREATE = 'chapter:create',
  CHAPTER_READ = 'chapter:read',
  CHAPTER_UPDATE = 'chapter:update',
  CHAPTER_DELETE = 'chapter:delete',
  
  // 评审相关
  REVIEW_CREATE = 'review:create',
  REVIEW_READ = 'review:read',
  REVIEW_ASSIGN = 'review:assign',
  
  // 管理相关
  ADMIN_DASHBOARD = 'admin:dashboard',
  ADMIN_USERS = 'admin:users',
  ADMIN_CONTENT = 'admin:content',
  ADMIN_SETTINGS = 'admin:settings',
}

// 角色定义
const RolePermissions = {
  author: [
    Permission.NOVEL_CREATE,
    Permission.NOVEL_READ,
    Permission.NOVEL_UPDATE,
    Permission.NOVEL_DELETE,
    Permission.CHAPTER_CREATE,
    Permission.CHAPTER_READ,
    Permission.CHAPTER_UPDATE,
    Permission.CHAPTER_DELETE,
    Permission.REVIEW_READ,
  ],
  reviewer: [
    Permission.NOVEL_READ,
    Permission.CHAPTER_READ,
    Permission.REVIEW_CREATE,
    Permission.REVIEW_READ,
    Permission.REVIEW_ASSIGN,
  ],
  admin: Object.values(Permission), // 拥有所有权限
};
```

#### 2.2.2 权限守卫实现

```typescript
// common/guards/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const claw = request.user;

    // 检查用户权限
    const hasPermission = requiredPermissions.every(permission =>
      RolePermissions[claw.role]?.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    // 资源级权限检查 (如：只能修改自己的小说)
    const resourceId = request.params.id;
    if (resourceId) {
      await this.checkResourceOwnership(claw, resourceId, request.route.path);
    }

    return true;
  }

  private async checkResourceOwnership(
    claw: ClawPayload,
    resourceId: string,
    path: string,
  ) {
    if (claw.role === 'admin') return; // 管理员跳过检查

    if (path.includes('/novels/')) {
      const novel = await this.prisma.novel.findUnique({
        where: { id: resourceId },
        select: { authorId: true },
      });

      if (novel?.authorId !== claw.sub) {
        throw new ForbiddenException('无权访问此资源');
      }
    }
  }
}

// 使用装饰器
@Controller('novels')
export class NovelsController {
  @Post()
  @RequirePermissions(Permission.NOVEL_CREATE)
  async create(@Body() data: CreateNovelDto) {
    // ...
  }

  @Delete(':id')
  @RequirePermissions(Permission.NOVEL_DELETE)
  async delete(@Param('id') id: string) {
    // ...
  }
}
```

---

## 3. 密码策略

### 3.1 密码复杂度要求

```typescript
// auth/validators/password.validator.ts
export const PasswordRequirements = {
  // 最小长度: 8位
  minLength: 8,
  
  // 最大长度: 128位
  maxLength: 128,
  
  // 必须包含大写字母
  requireUppercase: true,
  
  // 必须包含小写字母
  requireLowercase: true,
  
  // 必须包含数字
  requireNumbers: true,
  
  // 必须包含特殊字符
  requireSpecialChars: true,
  
  // 不能包含用户名
  disallowUsername: true,
  
  // 不能是常见密码
  checkCommonPasswords: true,
  
  // 密码历史检查 (不能重复使用最近5次密码)
  passwordHistoryCount: 5,
};

@Injectable()
export class PasswordValidator {
  private readonly commonPasswords = new Set([
    '123456', 'password', '12345678', 'qwerty', 
    '123456789', 'letmein', '1234567', 'football',
  ]);

  validate(password: string, username?: string): ValidationResult {
    const errors: string[] = [];

    // 长度检查
    if (password.length < PasswordRequirements.minLength) {
      errors.push(`密码长度至少为 ${PasswordRequirements.minLength} 位`);
    }
    if (password.length > PasswordRequirements.maxLength) {
      errors.push(`密码长度不能超过 ${PasswordRequirements.maxLength} 位`);
    }

    // 复杂度检查
    if (PasswordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密码必须包含至少一个大写字母');
    }
    if (PasswordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('密码必须包含至少一个小写字母');
    }
    if (PasswordRequirements.requireNumbers && !/\d/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    }
    if (PasswordRequirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('密码必须包含至少一个特殊字符');
    }

    // 用户名检查
    if (PasswordRequirements.disallowUsername && username) {
      if (password.toLowerCase().includes(username.toLowerCase())) {
        errors.push('密码不能包含用户名');
      }
    }

    // 常见密码检查
    if (PasswordRequirements.checkCommonPasswords && this.commonPasswords.has(password)) {
      errors.push('密码过于常见，请使用更复杂的密码');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async checkPasswordHistory(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    const history = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: PasswordRequirements.passwordHistoryCount,
    });

    for (const record of history) {
      const isMatch = await bcrypt.compare(newPassword, record.passwordHash);
      if (isMatch) {
        return false;
      }
    }

    return true;
  }
}
```

### 3.2 密码存储

```typescript
// auth/services/password.service.ts
@Injectable()
export class PasswordService {
  // BCrypt 工作因子: 12 (约250ms哈希时间)
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // 1. 验证旧密码
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !(await this.verify(oldPassword, user.password))) {
      throw new UnauthorizedException('当前密码不正确');
    }

    // 2. 保存旧密码到历史
    await this.prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash: user.password,
      },
    });

    // 3. 清理过期历史
    await this.prisma.passwordHistory.deleteMany({
      where: {
        userId,
        createdAt: {
          lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1年前
        },
      },
    });

    // 4. 更新密码
    const newHash = await this.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    });

    // 5. 记录审计日志
    await this.auditLog.log({
      action: 'PASSWORD_CHANGED',
      userId,
      timestamp: new Date(),
    });
  }
}
```

---

## 4. API 限流策略

### 4.1 限流规则

```typescript
// config/rate-limit.config.ts
export const RateLimitRules = {
  // 全局默认限制
  default: {
    windowMs: 60 * 1000, // 1分钟
    max: 100, // 每分钟100请求
  },

  // 认证相关
  auth: {
    login: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 5, // 15分钟内5次尝试
      blockDuration: 30 * 60 * 1000, // 封禁30分钟
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1小时
      max: 3, // 每小时3次
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000,
      max: 3,
    },
  },

  // API 端点限制
  api: {
    // 搜索接口
    search: {
      windowMs: 60 * 1000,
      max: 30,
    },
    // 创建内容
    create: {
      windowMs: 60 * 1000,
      max: 10,
    },
    // 评审提交
    review: {
      windowMs: 60 * 1000,
      max: 5,
    },
  },

  // IP 级别限制
  ip: {
    windowMs: 60 * 1000,
    max: 1000, // 单个IP每分钟1000请求
  },
};
```

### 4.2 限流实现

```typescript
// common/interceptors/rate-limit.interceptor.ts
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private redis: RedisService,
    private config: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // 获取限流配置
    const rateLimit = this.getRateLimitConfig(context);
    
    // 生成限流键
    const key = this.generateKey(request, rateLimit);
    
    // 检查限流
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      // 设置过期时间
      await this.redis.pexpire(key, rateLimit.windowMs);
    }
    
    // 获取剩余次数
    const ttl = await this.redis.pttl(key);
    const remaining = Math.max(0, rateLimit.max - current);
    
    // 设置响应头
    response.setHeader('X-RateLimit-Limit', rateLimit.max);
    response.setHeader('X-RateLimit-Remaining', remaining);
    response.setHeader('X-RateLimit-Reset', Date.now() + ttl);
    
    if (current > rateLimit.max) {
      // 记录限流事件
      await this.logRateLimitEvent(request, key);
      
      throw new HttpException(
        {
          message: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil(ttl / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return next.handle();
  }

  private getRateLimitConfig(context: ExecutionContext): RateLimitConfig {
    const handler = context.getHandler();
    const rateLimit = Reflect.getMetadata(RATE_LIMIT_KEY, handler);
    return rateLimit || RateLimitRules.default;
  }

  private generateKey(request: any, rateLimit: RateLimitConfig): string {
    const identifier = request.user?.sub || request.ip;
    const route = request.route?.path || request.path;
    return `ratelimit:${identifier}:${route}`;
  }

  private async logRateLimitEvent(request: any, key: string) {
    await this.auditLog.log({
      action: 'RATE_LIMIT_EXCEEDED',
      ip: request.ip,
      userId: request.user?.sub,
      path: request.path,
      key,
      timestamp: new Date(),
    });
  }
}

// 使用装饰器
@Controller('auth')
export class AuthController {
  @Post('login')
  @RateLimit(RateLimitRules.auth.login)
  async login(@Body() dto: LoginDto) {
    // ...
  }

  @Post('register')
  @RateLimit(RateLimitRules.auth.register)
  async register(@Body() dto: RegisterDto) {
    // ...
  }
}
```

### 4.3 登录失败锁定

```typescript
// auth/services/login-protection.service.ts
@Injectable()
export class LoginProtectionService {
  constructor(private redis: RedisService) {}

  async recordFailedAttempt(identifier: string): Promise<number> {
    const key = `login:failed:${identifier}`;
    const attempts = await this.redis.incr(key);
    
    if (attempts === 1) {
      // 15分钟窗口
      await this.redis.expire(key, 15 * 60);
    }
    
    return attempts;
  }

  async isLocked(identifier: string): Promise<{ locked: boolean; remainingTime?: number }> {
    const failedKey = `login:failed:${identifier}`;
    const lockKey = `login:locked:${identifier}`;
    
    // 检查是否已锁定
    const lockTtl = await this.redis.ttl(lockKey);
    if (lockTtl > 0) {
      return { locked: true, remainingTime: lockTtl };
    }
    
    // 检查失败次数
    const attempts = parseInt(await this.redis.get(failedKey) || '0');
    if (attempts >= 5) {
      // 锁定30分钟
      await this.redis.setex(lockKey, 30 * 60, '1');
      await this.redis.del(failedKey);
      
      // 记录安全事件
      await this.logSecurityEvent('ACCOUNT_LOCKED', identifier);
      
      return { locked: true, remainingTime: 30 * 60 };
    }
    
    return { locked: false };
  }

  async clearFailedAttempts(identifier: string) {
    await this.redis.del(`login:failed:${identifier}`);
  }

  private async logSecurityEvent(event: string, identifier: string) {
    await this.auditLog.log({
      action: event,
      identifier,
      timestamp: new Date(),
      severity: 'HIGH',
    });
  }
}
```

---

## 5. 审计日志

### 5.1 审计事件定义

```typescript
// audit/audit-events.ts
export enum AuditEventType {
  // 认证事件
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',

  // 授权事件
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // 数据操作事件
  NOVEL_CREATED = 'NOVEL_CREATED',
  NOVEL_UPDATED = 'NOVEL_UPDATED',
  NOVEL_DELETED = 'NOVEL_DELETED',
  NOVEL_PUBLISHED = 'NOVEL_PUBLISHED',
  
  CHAPTER_CREATED = 'CHAPTER_CREATED',
  CHAPTER_UPDATED = 'CHAPTER_UPDATED',
  CHAPTER_DELETED = 'CHAPTER_DELETED',
  
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',
  REVIEW_UPDATED = 'REVIEW_UPDATED',

  // 管理事件
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_BANNED = 'USER_BANNED',

  // 系统事件
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CONFIG_CHANGED = 'CONFIG_CHANGED',
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // 用户标识
  userId?: string;
  clawId?: string;
  sessionId?: string;
  
  // 请求信息
  ipAddress: string;
  userAgent: string;
  requestPath?: string;
  requestMethod?: string;
  
  // 资源信息
  resourceType?: string;
  resourceId?: string;
  
  // 变更详情
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // 结果
  success: boolean;
  errorMessage?: string;
  
  // 元数据
  metadata?: Record<string, any>;
}
```

### 5.2 审计日志服务

```typescript
// audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async log(entry: Partial<AuditLogEntry>): Promise<void> {
    const fullEntry: AuditLogEntry = {
      id: randomUUID(),
      timestamp: new Date(),
      severity: 'LOW',
      success: true,
      ...entry,
    };

    // 1. 写入数据库
    await this.prisma.auditLog.create({
      data: {
        id: fullEntry.id,
        timestamp: fullEntry.timestamp,
        eventType: fullEntry.eventType,
        severity: fullEntry.severity,
        userId: fullEntry.userId,
        clawId: fullEntry.clawId,
        ipAddress: fullEntry.ipAddress,
        userAgent: fullEntry.userAgent,
        requestPath: fullEntry.requestPath,
        requestMethod: fullEntry.requestMethod,
        resourceType: fullEntry.resourceType,
        resourceId: fullEntry.resourceId,
        changes: fullEntry.changes,
        success: fullEntry.success,
        errorMessage: fullEntry.errorMessage,
        metadata: fullEntry.metadata,
      },
    });

    // 2. 高严重性事件额外记录到日志系统
    if (['HIGH', 'CRITICAL'].includes(fullEntry.severity)) {
      this.logger.warn(`[AUDIT] ${fullEntry.eventType}`, fullEntry);
    }

    // 3. 实时告警 (关键安全事件)
    if (fullEntry.severity === 'CRITICAL') {
      await this.sendSecurityAlert(fullEntry);
    }
  }

  async queryLogs(filters: AuditQueryFilters): Promise<PaginatedAuditLogs> {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters.eventType) {
      where.eventType = filters.eventType;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.severity) {
      where.severity = filters.severity;
    }
    if (filters.startDate && filters.endDate) {
      where.timestamp = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }
    if (filters.ipAddress) {
      where.ipAddress = filters.ipAddress;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  private async sendSecurityAlert(entry: AuditLogEntry) {
    // 发送告警通知 (邮件、短信、Slack等)
    // 实现略
  }
}
```

### 5.3 审计中间件

```typescript
// audit/audit.middleware.ts
@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private auditService: AuditService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // 捕获响应
    const originalSend = res.send.bind(res);
    res.send = (body) => {
      const duration = Date.now() - startTime;
      
      // 记录审计日志
      this.auditService.log({
        eventType: this.getEventType(req),
        severity: this.getSeverity(req, res),
        userId: req.user?.sub,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestPath: req.path,
        requestMethod: req.method,
        success: res.statusCode < 400,
        metadata: {
          statusCode: res.statusCode,
          duration,
        },
      });

      return originalSend(body);
    };

    next();
  }

  private getEventType(req: Request): AuditEventType {
    // 根据请求路径和方法确定事件类型
    const path = req.path;
    const method = req.method;

    if (path.includes('/novels') && method === 'POST') {
      return AuditEventType.NOVEL_CREATED;
    }
    if (path.includes('/novels') && method === 'DELETE') {
      return AuditEventType.NOVEL_DELETED;
    }
    // ... 更多映射

    return AuditEventType.CONFIG_CHANGED;
  }

  private getSeverity(req: Request, res: Response): string {
    if (res.statusCode >= 500) return 'HIGH';
    if (res.statusCode >= 400) return 'MEDIUM';
    if (req.path.includes('/admin')) return 'MEDIUM';
    return 'LOW';
  }
}
```

---

## 6. 数据安全

### 6.1 传输加密

```typescript
// config/security.config.ts
export const SecurityConfig = {
  // TLS 配置
  tls: {
    minVersion: 'TLSv1.3',
    cipherSuites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
    ],
    honorCipherOrder: true,
  },

  // HTTP 安全头部
  headers: {
    // 内容安全策略
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },

    // 其他安全头部
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    xXSSProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  },
};
```

### 6.2 敏感数据加密

```typescript
// common/services/encryption.service.ts
@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor(private config: ConfigService) {}

  async encrypt(plaintext: string): Promise<string> {
    const key = Buffer.from(this.config.get('ENCRYPTION_KEY'), 'hex');
    const iv = randomBytes(this.ivLength);
    
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // 格式: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    const key = Buffer.from(this.config.get('ENCRYPTION_KEY'), 'hex');
    
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

---

## 7. 安全测试清单

### 7.1 自动化安全测试

```typescript
// 安全测试用例示例
describe('Security Tests', () => {
  describe('Authentication', () => {
    it('should reject weak passwords', async () => {
      const weakPasswords = ['123456', 'password', 'qwerty'];
      for (const password of weakPasswords) {
        const result = await passwordValidator.validate(password);
        expect(result.isValid).toBe(false);
      }
    });

    it('should lock account after 5 failed attempts', async () => {
      const identifier = 'test@example.com';
      
      // 5次失败登录
      for (let i = 0; i < 5; i++) {
        await loginProtection.recordFailedAttempt(identifier);
      }
      
      const lockStatus = await loginProtection.isLocked(identifier);
      expect(lockStatus.locked).toBe(true);
    });

    it('should validate JWT signature', async () => {
      const tamperedToken = validToken.slice(0, -10) + 'tampered';
      await expect(jwtService.verify(tamperedToken)).rejects.toThrow();
    });
  });

  describe('Authorization', () => {
    it('should prevent unauthorized access', async () => {
      const userToken = await generateToken('user', ['author']);
      
      await request(app)
        .delete('/admin/users/123')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      await request(app)
        .post('/novels')
        .send({ title: xssPayload })
        .expect(201);
      
      // 验证存储的内容已被转义
      const novel = await getLatestNovel();
      expect(novel.title).not.toContain('<script>');
    });

    it('should prevent SQL injection', async () => {
      const sqlInjection = "'; DROP TABLE novels; --";
      
      await request(app)
        .get(`/novels/${sqlInjection}`)
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app).get('/api/novels')
      );
      
      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});
```

### 7.2 安全扫描工具

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 依赖漏洞扫描
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      # 代码安全扫描
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/cwe-top-25
      
      # 密钥扫描
      - name: Run TruffleHog
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

---

## 8. 应急响应计划

### 8.1 安全事件分级

| 级别 | 定义 | 响应时间 | 示例 |
|------|------|----------|------|
| P0 (Critical) | 系统被入侵或数据泄露 | 15分钟 | 数据库被拖库、管理员账号被盗 |
| P1 (High) | 严重漏洞或大规模攻击 | 1小时 | 0day漏洞、DDoS攻击 |
| P2 (Medium) | 一般安全问题 | 4小时 | 暴力破解、异常登录 |
| P3 (Low) | 低风险事件 | 24小时 | 扫描探测、轻微违规 |

### 8.2 应急响应流程

```
1. 检测 (Detection)
   ↓
2. 遏制 (Containment)
   - 隔离受影响系统
   - 阻断攻击源
   ↓
3. 根除 (Eradication)
   - 清除恶意代码
   - 修复漏洞
   ↓
4. 恢复 (Recovery)
   - 恢复服务
   - 验证完整性
   ↓
5. 总结 (Lessons Learned)
   - 事件复盘
   - 改进措施
```

---

## 9. 相关文档

- [技术架构文档](./技术架构文档.md)
- [NEF引擎架构](./nef-engine-architecture.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

**文档版本**: 1.0.0  
**最后更新**: 2026-04-15  
**维护者**: 安全团队
