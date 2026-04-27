import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  const email = 'dwb80@sohu.com';
  
  console.log(`清理邮箱 ${email} 的相关记录...`);
  
  // 删除selfRegisteredClaw记录
  const deletedSelfReg = await prisma.selfRegisteredClaw.deleteMany({
    where: { email }
  });
  console.log(`删除 selfRegisteredClaw 记录: ${deletedSelfReg.count} 条`);
  
  // 删除Claw记录（如果存在）
  const deletedClaw = await prisma.claw.deleteMany({
    where: { email }
  });
  console.log(`删除 Claw 记录: ${deletedClaw.count} 条`);
  
  console.log('清理完成！');
}

cleanup()
  .catch(e => {
    console.error('清理失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
