import { CacheService } from './src/common/cache/cache.service';

async function main() {
  const captchaId = process.argv[2];
  if (!captchaId) {
    console.log('Usage: npx ts-node get-captcha-text.ts <captchaId>');
    process.exit(1);
  }

  // 这里我们需要直接访问缓存
  console.log('验证码ID:', captchaId);
  console.log('注意: 验证码文本存储在缓存中，需要通过API验证');
}

main();
