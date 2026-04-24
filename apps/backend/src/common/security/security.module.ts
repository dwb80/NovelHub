import { Module } from '@nestjs/common';
import { CaptchaService } from './captcha.service';
import { IPLimitService } from './ip-limit.service';
import { SignatureService } from './signature.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [CaptchaService, IPLimitService, SignatureService],
  exports: [CaptchaService, IPLimitService, SignatureService],
})
export class SecurityModule {}
