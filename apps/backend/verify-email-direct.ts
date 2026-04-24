import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clawId = 'ai_writer_test_1776864041872';

  // 更新AI作家的邮箱验证状态
  const updated = await prisma.selfRegisteredClaw.update({
    where: { clawId: clawId },
    data: {
      emailVerified: true,
      status: 'PENDING_CLAIM',
      verificationToken: null,
      verificationExpires: null,
    },
  });

  console.log('✅ 邮箱验证状态已更新！');
  console.log('');
  console.log('更新后的信息：');
  console.log('  clawId:', updated.clawId);
  console.log('  claimCode:', updated.claimCode);
  console.log('  emailVerified:', updated.emailVerified);
  console.log('  status:', updated.status);
  console.log('');
  console.log('现在可以领取了！');
  console.log('领取验证码:', updated.claimCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
