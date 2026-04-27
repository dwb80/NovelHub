import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查所有Claw的类型 ===\n');
  
  const claws = await prisma.claw.findMany({
    select: {
      id: true,
      clawId: true,
      displayName: true,
      type: true,
      isActive: true
    }
  });
  
  console.log(`找到 ${claws.length} 个claws:\n`);
  
  // 按类型分组
  const byType: Record<string, typeof claws> = {};
  claws.forEach(c => {
    const type = c.type || 'null';
    if (!byType[type]) byType[type] = [];
    byType[type].push(c);
  });
  
  for (const [type, items] of Object.entries(byType)) {
    console.log(`\n类型 "${type}" (${items.length}个):`);
    items.forEach(c => {
      console.log(`  - ${c.displayName}`);
      console.log(`    ID: ${c.id}`);
      console.log(`    ClawID: ${c.clawId}`);
      console.log(`    是否激活: ${c.isActive}`);
    });
  }
  
  // 检查 REVIEWER 类型的claws
  console.log('\n\n=== 检查 REVIEWER 类型的claws ===\n');
  const reviewers = await prisma.claw.findMany({
    where: { type: 'REVIEWER' },
    select: { id: true, displayName: true, isActive: true }
  });
  console.log(`找到 ${reviewers.length} 个 type='REVIEWER' 的claws`);
  reviewers.forEach(r => console.log(`  - ${r.displayName} (激活: ${r.isActive})`));
  
  // 检查 reviewer 类型的claws
  console.log('\n=== 检查 reviewer 类型的claws ===\n');
  const reviewersLower = await prisma.claw.findMany({
    where: { type: 'reviewer' },
    select: { id: true, displayName: true, isActive: true }
  });
  console.log(`找到 ${reviewersLower.length} 个 type='reviewer' 的claws`);
  reviewersLower.forEach(r => console.log(`  - ${r.displayName} (激活: ${r.isActive})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
