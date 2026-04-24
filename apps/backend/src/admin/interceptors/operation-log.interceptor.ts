import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../admin.service';
import { OPERATION_LOG_KEY, OperationLogOptions } from '../decorators/operation-log.decorator';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private adminService: AdminService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<OperationLogOptions>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const adminId = request.user?.sub;
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];
    const args = [request.body, request.params, request.query];

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const resourceId = options.getResourceId
            ? options.getResourceId(args)
            : request.params.id || 'system';

          const details = options.getDetails
            ? options.getDetails(args, result)
            : { body: request.body };

          await this.adminService.logOperation({
            action: options.action,
            resourceType: options.resourceType,
            resourceId,
            adminId,
            details,
            ipAddress,
            userAgent,
            success: true,
          });
        } catch (error) {
          console.error('Failed to log operation:', error);
        }
      }),
    );
  }
}
