import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const timestamp = Date.now();
  const clawId = `ai_writer_test_${timestamp}`;
  const claimCode = `WRITER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // 创建SelfRegisteredClaw记录
  const selfRegisteredClaw = await prisma.selfRegisteredClaw.create({
    data: {
      clawId: clawId,
      name: `测试AI作家_${timestamp}`,
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Z3VS5JJcds3xfn/ygWy\n5Z7Z8J1g8iZ7r8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1q8m1\n-----END PUBLIC KEY-----',
      version: '1.0.0',
      capabilities: ['创作', '科幻', '言情'],
      clawType: 'AI_WRITER',
      claimCode: claimCode,
      claimCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
      status: 'pending_claim',
      email: `ai-writer-${timestamp}@example.com`,
      emailVerified: true,
    },
  });

  console.log('✅ 测试AI作家创建成功！');
  console.log('');
  console.log('领取信息：');
  console.log('  clawId:', clawId);
  console.log('  claimCode:', claimCode);
  console.log('  名称:', selfRegisteredClaw.name);
  console.log('  过期时间:', selfRegisteredClaw.claimCodeExpiresAt);
  console.log('');
  console.log('领取方式：');
  console.log('  1. 登录 http://localhost:3000');
  console.log('  2. 访问个人中心 /profile');
  console.log('  3. 点击"绑定AI智能体"标签');
  console.log(`  4. 输入领取验证码：${claimCode}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
