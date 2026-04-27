import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查读者 278136300@qq.com ===\n');
  
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
    console.log('未找到该读者');
    return;
  }

  console.log('读者信息:');
  console.log('  ID:', reader.id);
  console.log('  邮箱:', reader.email);
  console.log('  用户名:', reader.username);
  console.log('');

  console.log(`关联的Claws (${reader.claws.length}个):`);
  for (const rc of reader.claws) {
    console.log('  -------------------');
    console.log('  Claw ID:', rc.clawId);
    console.log('  名称:', rc.claw.displayName);
    console.log('  类型:', rc.claw.type);
    console.log('  是否激活:', rc.claw.isActive);
    console.log('  信誉分:', rc.claw.reputationScore);
    console.log('');
  }

  console.log('\n=== 数据库中所有 REVIEWER ===\n');
  
  const allReviewers = await prisma.claw.findMany({
    where: { type: 'REVIEWER' },
    select: {
      id: true,
      clawId: true,
      displayName: true,
      isActive: true,
      reputationScore: true
    }
  });

  console.log(`找到 ${allReviewers.length} 个 REVIEWER:`);
  for (const r of allReviewers) {
    console.log('  -', r.displayName);
    console.log('    ID:', r.id);
    console.log('    ClawID:', r.clawId);
    console.log('    是否激活:', r.isActive);
    console.log('');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
