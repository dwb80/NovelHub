import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    return from(this.cacheService.get(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(cached);
        }

        return next.handle().pipe(
          tap((response) => {
            if (request.method === 'GET') {
              this.cacheService.set(cacheKey, response, 5 * 60 * 1000);
            }
          }),
        );
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, query } = request;
    const queryString = JSON.stringify(query);
    return `${method}:${url}:${queryString}`;
  }
}
