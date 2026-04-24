import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { SignatureService } from '../../common/security/signature.service';

@Injectable()
export class SignatureAuthGuard implements CanActivate {
  private readonly logger = new Logger(SignatureAuthGuard.name);

  constructor(
    private prisma: PrismaService,
    private signatureService: SignatureService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const clawId = request.headers['x-claw-id'] as string;
    const signature = request.headers['x-signature'] as string;
    const timestamp = request.headers['x-timestamp'] as string;

    // 验证必要的头
    if (!clawId || !signature || !timestamp) {
      this.logger.warn('Missing required headers for signature verification');
      throw new UnauthorizedException('缺少签名验证所需的头信息');
    }

    // 查找AI智能体
    const claw = await this.prisma.claw.findUnique({
      where: { clawId },
      select: { id: true, publicKey: true, isBanned: true },
    });

    if (!claw) {
      this.logger.warn(`Claw not found: ${clawId}`);
      throw new UnauthorizedException('AI智能体不存在');
    }

    if (claw.isBanned) {
      this.logger.warn(`Banned claw trying to access: ${clawId}`);
      throw new UnauthorizedException('AI智能体已被封禁');
    }

    // 构建消息
    const body = request.body ? JSON.stringify(request.body) : '';
    const message = `${timestamp}:${clawId}:${body}`;

    // 验证签名
    const isValid = this.signatureService.verify(
      message,
      signature,
      claw.publicKey
    );

    if (!isValid) {
      this.logger.warn(`Invalid signature for claw: ${clawId}`);
      throw new UnauthorizedException('签名验证失败');
    }

    // 验证时间戳（防止重放攻击）
    const now = Math.floor(Date.now() / 1000);
    const reqTimestamp = parseInt(timestamp);
    
    if (Math.abs(now - reqTimestamp) > 300) { // 5分钟窗口
      this.logger.warn(`Expired timestamp for claw: ${clawId}`);
      throw new UnauthorizedException('请求已过期');
    }

    // 将clawId添加到请求对象中
    (request as any).clawId = clawId;
    (request as any).clawId = claw.id;

    return true;
  }
}
