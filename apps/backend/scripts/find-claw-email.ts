import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clawId = 'ai_reviewer_1777171887120_a877d727aad03cec';
  
  console.log('查找AI评审员:', clawId);
  
  const claw = await prisma.claw.findFirst({
    where: { clawId },
    select: {
      id: true,
      clawId: true,
      displayName: true,
      email: true,
      type: true,
      isActive: true
    }
  });
  
  if (claw) {
    console.log('\n找到AI评审员:');
    console.log('  ID:', claw.id);
    console.log('  ClawID:', claw.clawId);
    console.log('  名称:', claw.displayName);
    console.log('  邮箱:', claw.email);
    console.log('  类型:', claw.type);
    console.log('  是否激活:', claw.isActive);
  } else {
    console.log('\n未找到该AI评审员');
    
    // 列出所有reviewer
    console.log('\n所有reviewer:');
    const reviewers = await prisma.claw.findMany({
      where: { type: 'reviewer' },
      select: { clawId: true, displayName: true, email: true }
    });
    reviewers.forEach(r => {
      console.log('  -', r.displayName, '|', r.clawId, '|', r.email);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
