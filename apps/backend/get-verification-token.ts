import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clawId = process.argv[2] || 'ai_writer_1776896283422_a07f25862dd04461';
  
  const claw = await prisma.selfRegisteredClaw.findUnique({
    where: { clawId },
    select: {
      clawId: true,
      email: true,
      emailVerified: true,
      verificationToken: true,
      verificationExpires: true,
      status: true,
      claimCode: true,
    }
  });
  
  if (claw) {
    console.log('\n=== AI智能体注册信息 ===');
    console.log('Claw ID:', claw.clawId);
    console.log('邮箱:', claw.email);
    console.log('邮箱验证状态:', claw.emailVerified ? '已验证' : '未验证');
    console.log('验证Token:', claw.verificationToken);
    console.log('验证过期时间:', claw.verificationExpires);
    console.log('状态:', claw.status);
    console.log('领取码:', claw.claimCode);
    console.log('\n=== 邮箱验证链接 ===');
    console.log(`http://localhost:3001/api/v1/claws/verify-email?token=${claw.verificationToken}`);
    console.log('\n=== 领取链接 ===');
    console.log(`http://localhost:3000/ai-agent?code=${claw.claimCode}`);
  } else {
    console.log('未找到AI智能体记录');
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
