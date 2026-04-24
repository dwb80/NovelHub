import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `${ip}:${userId}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const whitelist = [
      '/health',
      '/api/health',
      '/auth/refresh',
    ];
    
    if (whitelist.some(path => req.path.startsWith(path))) {
      return true;
    }

    if ((req as any).user?.role === 'ADMIN') {
      return true;
    }

    return false;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: Record<string, any>,
  ): Promise<void> {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    throw new ThrottlerException(
      `请求过于频繁，请稍后再试。IP: ${ip}`,
    );
  }
}
