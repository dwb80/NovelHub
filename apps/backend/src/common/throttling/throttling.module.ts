import { Module, Global } from '@nestjs/common';
import { AIThrottleService } from './ai-throttle.service';
import { ThrottleGuard } from './throttle.guard';

@Global()
@Module({
  providers: [AIThrottleService, ThrottleGuard],
  exports: [AIThrottleService, ThrottleGuard],
})
export class ThrottlingModule {}
