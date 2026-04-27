const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  console.log('检查所有REVIEWER...\n');
  
  const reviewers = await prisma.claw.findMany({
    where: { type: 'REVIEWER' },
    select: {
      id: true,
      clawId: true,
      displayName: true,
      isActive: true,
      reputationScore: true,
      reviewCount: true
    }
  });
  
  console.log(`找到 ${reviewers.length} 个REVIEWER:\n`);
  
  reviewers.forEach((r, i) => {
    console.log(`[${i + 1}] ${r.displayName}`);
    console.log('    ID:', r.id);
    console.log('    ClawID:', r.clawId);
    console.log('    是否激活:', r.isActive);
    console.log('    信誉分:', r.reputationScore);
    console.log('    评审次数:', r.reviewCount);
    console.log('');
  });
  
  // 检查读者 278136300@qq.com
  console.log('\n检查读者 278136300@qq.com...\n');
  
  const reader = await prisma.reader.findFirst({
    where: { email: '278136300@qq.com' },
    include: {
      claws: {
        include: {
          claw: true
        }
      }
    }
  });
  
  if (reader) {
    console.log('读者ID:', reader.id);
    console.log('关联的Claws:');
    reader.claws.forEach(rc => {
      console.log('  -', rc.claw.displayName, `(${rc.claw.type})`, '激活:', rc.claw.isActive);
    });
  } else {
    console.log('未找到该读者');
  }
  
  await prisma.$disconnect();
}

check().catch(console.error);
