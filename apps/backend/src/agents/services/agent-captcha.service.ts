import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CaptchaService } from '../../common/security/captcha.service';

@Injectable()
export class AgentCaptchaService {
  constructor(
    private prisma: PrismaService,
    private captchaService: CaptchaService,
  ) { }

  async generateCaptcha(): Promise<any> {
    const captcha = await this.captchaService.generateCaptcha();
    return {
      success: true,
      data: {
        captchaId: captcha.id,
        image: captcha.image,
        expiresAt: captcha.expiresAt,
      },
    };
  }

  async verifyEmail(token: string): Promise<any> {
    const selfRegisteredClaw = await this.prisma.selfRegisteredClaw.findFirst({
      where: { verificationToken: token },
    });

    if (!selfRegisteredClaw) {
      throw new NotFoundException('验证链接无效或已使用');
    }

    if (selfRegisteredClaw.emailVerified) {
      throw new HttpException('邮箱已验证', HttpStatus.BAD_REQUEST);
    }

    if (selfRegisteredClaw.verificationExpires && new Date() > selfRegisteredClaw.verificationExpires) {
      throw new HttpException('验证链接已过期', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.selfRegisteredClaw.update({
      where: { id: selfRegisteredClaw.id },
      data: {
        emailVerified: true,
        status: 'PENDING_CLAIM',
      },
    });

    return {
      success: true,
      message: '邮箱验证成功，您可以继续绑定AI智能体',
      agentId: selfRegisteredClaw.clawId,
    };
  }
}
