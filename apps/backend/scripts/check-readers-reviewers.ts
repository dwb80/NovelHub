import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReadersReviewers() {
  // 查找邮箱为 278136300@qq.com 的读者
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

  if (!reader) {
    console.log('未找到读者 278136300@qq.com');
    return;
  }

  console.log('读者信息:');
  console.log('  ID:', reader.id);
  console.log('  邮箱:', reader.email);
  console.log('  用户名:', reader.username);
  console.log('');

  console.log('关联的Claws:');
  for (const rc of reader.claws) {
    console.log('  - Claw ID:', rc.clawId);
    console.log('    名称:', rc.claw.displayName);
    console.log('    类型:', rc.claw.type);
    console.log('    是否激活:', rc.claw.isActive);
    console.log('');
  }

  // 检查所有 REVIEWER 类型的 claw
  console.log('\n数据库中所有 REVIEWER:');
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

  for (const r of reviewers) {
    console.log('  - ID:', r.id);
    console.log('    ClawID:', r.clawId);
    console.log('    名称:', r.displayName);
    console.log('    是否激活:', r.isActive);
    console.log('    信誉分:', r.reputationScore);
    console.log('    评审次数:', r.reviewCount);
    console.log('');
  }
}

checkReadersReviewers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
