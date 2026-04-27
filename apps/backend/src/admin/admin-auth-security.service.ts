import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Admin } from '@prisma/client';

interface LoginAttempt {
  count: number;
  firstAttempt: Date;
  lockedUntil?: Date;
}

interface RsaKeyPair {
  publicKey: string;
  privateKey: string;
}

@Injectable()
export class AdminAuthSecurityService {
  // 登录失败限制配置
  private readonly MAX_LOGIN_ATTEMPTS = 5; // 最大尝试次数
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 锁定30分钟（毫秒）
  private readonly ATTEMPT_WINDOW = 15 * 60 * 1000; // 15分钟窗口期（毫秒）

  // 内存中存储登录尝试记录（生产环境应使用Redis）
  private loginAttempts = new Map<string, LoginAttempt>();

  // RSA密钥对缓存（定期轮换）
  private rsaKeyPair: RsaKeyPair | null = null;
  private keyPairGeneratedAt: Date | null = null;
  private readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24小时轮换

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    // 初始化RSA密钥对
    this.generateRsaKeyPair();
  }

  /**
   * 生成RSA密钥对
   */
  private generateRsaKeyPair(): RsaKeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.rsaKeyPair = { publicKey, privateKey };
    this.keyPairGeneratedAt = new Date();

    return this.rsaKeyPair;
  }

  /**
   * 获取RSA公钥（用于前端加密密码）
   */
  getPublicKey(): string {
    // 检查是否需要轮换密钥
    if (this.rsaKeyPair && this.keyPairGeneratedAt) {
      const now = new Date();
      const elapsed = now.getTime() - this.keyPairGeneratedAt.getTime();
      if (elapsed > this.KEY_ROTATION_INTERVAL) {
        this.generateRsaKeyPair();
      }
    }

    return this.rsaKeyPair?.publicKey || this.generateRsaKeyPair().publicKey;
  }

  /**
   * 解密密码
   */
  decryptPassword(encryptedPassword: string): string {
    if (!this.rsaKeyPair) {
      throw new Error('RSA密钥对未初始化');
    }

    try {
      const decrypted = crypto.privateDecrypt(
        {
          key: this.rsaKeyPair.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        Buffer.from(encryptedPassword, 'base64')
      );

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('密码解密失败:', error);
      throw new UnauthorizedException('密码解密失败，请重新获取公钥');
    }
  }

  /**
   * 检查登录失败限制
   */
  checkLoginAttempts(identifier: string): void {
    const now = new Date();
    const attempt = this.loginAttempts.get(identifier);

    if (attempt) {
      // 检查是否处于锁定状态
      if (attempt.lockedUntil && attempt.lockedUntil > now) {
        const remainingMinutes = Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 60000);
        throw new HttpException(
          `登录失败次数过多，账号已锁定。请${remainingMinutes}分钟后重试`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      // 检查是否在窗口期内
      const elapsed = now.getTime() - attempt.firstAttempt.getTime();
      if (elapsed > this.ATTEMPT_WINDOW) {
        // 超过窗口期，重置计数
        this.loginAttempts.set(identifier, {
          count: 0,
          firstAttempt: now,
        });
      }
    }
  }

  /**
   * 记录登录失败
   */
  recordFailedLogin(identifier: string): void {
    const now = new Date();
    const attempt = this.loginAttempts.get(identifier);

    if (!attempt) {
      this.loginAttempts.set(identifier, {
        count: 1,
        firstAttempt: now,
      });
    } else {
      const newCount = attempt.count + 1;

      if (newCount >= this.MAX_LOGIN_ATTEMPTS) {
        // 达到最大尝试次数，锁定账号
        const lockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION);
        this.loginAttempts.set(identifier, {
          count: newCount,
          firstAttempt: attempt.firstAttempt,
          lockedUntil,
        });
      } else {
        this.loginAttempts.set(identifier, {
          count: newCount,
          firstAttempt: attempt.firstAttempt,
        });
      }
    }
  }

  /**
   * 清除登录失败记录（登录成功时调用）
   */
  clearLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /**
   * 获取剩余尝试次数
   */
  getRemainingAttempts(identifier: string): number {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt) return this.MAX_LOGIN_ATTEMPTS;
    return Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempt.count);
  }

  /**
   * 验证管理员（带安全检查）
   */
  async validateAdmin(
    username: string,
    encryptedPassword: string,
    clientIp: string
  ): Promise<Admin | null> {
    const identifier = `${username}:${clientIp}`;

    // 检查登录失败限制
    this.checkLoginAttempts(identifier);

    // 解密密码
    let password: string;
    try {
      password = this.decryptPassword(encryptedPassword);
    } catch (error) {
      this.recordFailedLogin(identifier);
      const remaining = this.getRemainingAttempts(identifier);
      throw new UnauthorizedException(
        `密码解密失败，剩余尝试次数: ${remaining}`
      );
    }

    // 查找管理员
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      this.recordFailedLogin(identifier);
      const remaining = this.getRemainingAttempts(identifier);
      throw new UnauthorizedException(
        `账号或密码错误，剩余尝试次数: ${remaining}`
      );
    }

    // 检查账号是否被锁定
    if (admin.locked_until && admin.locked_until > new Date()) {
      const remainingMinutes = Math.ceil((admin.locked_until.getTime() - Date.now()) / 60000);
      throw new HttpException(
        `账号已被锁定，请${remainingMinutes}分钟后重试`,
        HttpStatus.FORBIDDEN
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      this.recordFailedLogin(identifier);
      const remaining = this.getRemainingAttempts(identifier);

      // 注意：数据库中未存储失败次数，使用内存中的记录
      // 生产环境建议添加 failed_login_attempts, last_failed_login 字段到 Admin 模型

      throw new UnauthorizedException(
        `账号或密码错误，剩余尝试次数: ${remaining}`
      );
    }

    // 登录成功，清除失败记录
    this.clearLoginAttempts(identifier);

    // 更新登录时间（如果数据库支持）
    try {
      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      // 字段可能不存在，忽略错误
    }

    return admin;
  }

  /**
   * 生成JWT令牌
   */
  generateToken(admin: Admin): string {
    const payload = {
      sub: admin.id,
      username: admin.username,
      type: 'admin',
      permissions: admin.permissions,
    };

    return this.jwtService.sign(payload, { expiresIn: '2h' });
  }
}
