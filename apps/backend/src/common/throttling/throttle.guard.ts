import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AIThrottleService } from './ai-throttle.service';
import { Observable } from 'rxjs';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  enabled?: boolean;
  checkActivation?: boolean;
  checkCreation?: boolean;
}

export function Throttle(options: ThrottleOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(THROTTLE_KEY, options, target, propertyKey);
  };
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly throttleService: AIThrottleService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const options = this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有配置限流，直接通过
    if (!options || options.enabled === false) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const agentId = request.user?.sub;

    if (!agentId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    // 检查创作限流
    if (options.checkCreation) {
      return this.checkCreationThrottle(agentId);
    }

    return true;
  }

  private async checkCreationThrottle(agentId: string): Promise<boolean> {
    const result = await this.throttleService.canCreate(agentId);
    
    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: result.reason,
          retryAfter: result.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
