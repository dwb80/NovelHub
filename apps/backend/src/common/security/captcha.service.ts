import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const svgCaptcha = require('svg-captcha');
import { CacheService } from '../cache/cache.service';

export interface CaptchaResult {
  id: string;
  image: string; // SVG格式
  expiresAt: Date;
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly isEnabled: boolean;
  private readonly captchaConfig = {
    size: 4,           // 验证码长度
    width: 120,        // 宽度
    height: 40,        // 高度
    fontSize: 30,      // 字体大小
    noise: 3,          // 干扰线条数
    color: true,       // 彩色
    background: '#f0f0f0', // 背景色
  };

  constructor(
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {
    this.isEnabled = this.configService.get<boolean>('CAPTCHA_ENABLED') || true;
  }

  /**
   * 生成验证码
   */
  async generateCaptcha(): Promise<CaptchaResult> {
    if (!this.isEnabled) {
      return {
        id: 'disabled',
        image: '',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
    }

    const captcha = svgCaptcha.create(this.captchaConfig);
    const captchaId = this.generateCaptchaId();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

    // 保存到缓存
    await this.cacheService.set(
      `captcha:${captchaId}`,
      captcha.text.toLowerCase(),
      5 * 60 * 1000
    );

    this.logger.debug(`Generated captcha: ${captcha.text} for ID: ${captchaId}`);

    return {
      id: captchaId,
      image: captcha.data,
      expiresAt,
    };
  }

  /**
   * 验证验证码
   */
  async verify(captchaId: string, userInput: string): Promise<boolean> {
    if (!this.isEnabled) {
      return true; // 验证码未启用时，直接通过
    }

    if (!captchaId || !userInput) {
      return false;
    }

    const storedCaptcha = await this.cacheService.get<string>(`captcha:${captchaId}`);
    if (!storedCaptcha) {
      this.logger.warn(`Captcha not found or expired: ${captchaId}`);
      return false;
    }

    const isValid = storedCaptcha === userInput.toLowerCase();

    // 验证后删除验证码
    await this.cacheService.delete(`captcha:${captchaId}`);

    if (!isValid) {
      this.logger.warn(`Invalid captcha for ID ${captchaId}: expected ${storedCaptcha}, got ${userInput}`);
    }

    return isValid;
  }

  /**
   * 生成验证码ID
   */
  private generateCaptchaId(): string {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
}
