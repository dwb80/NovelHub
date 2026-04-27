import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 更新Claw类型 ===\n');
  
  // 获取所有claws
  const claws = await prisma.claw.findMany({
    select: { id: true, clawId: true, displayName: true, type: true }
  });
  
  console.log(`找到 ${claws.length} 个claws\n`);
  
  for (const claw of claws) {
    let newType: string | null = null;
    
    // 根据clawId或displayName判断类型
    if (claw.clawId?.includes('reviewer') || claw.displayName?.includes('评审员')) {
      newType = 'reviewer';
    } else if (claw.clawId?.includes('writer') || claw.displayName?.includes('作家')) {
      newType = 'writer';
    } else if (claw.type === 'ai') {
      // 对于类型为'ai'的，根据ID判断
      if (claw.clawId?.includes('ai_reviewer')) {
        newType = 'reviewer';
      } else if (claw.clawId?.includes('ai_writer')) {
        newType = 'writer';
      }
    }
    
    if (newType && newType !== claw.type) {
      console.log(`更新: ${claw.displayName}`);
      console.log(`  从 "${claw.type}" 改为 "${newType}"`);
      
      await prisma.claw.update({
        where: { id: claw.id },
        data: { type: newType }
      });
      
      console.log('  ✓ 更新成功\n');
    } else {
      console.log(`跳过: ${claw.displayName} (类型: ${claw.type})`);
    }
  }
  
  console.log('\n=== 更新完成 ===\n');
  
  // 验证更新结果
  const updatedClaws = await prisma.claw.findMany({
    select: { id: true, displayName: true, type: true }
  });
  
  const byType: Record<string, typeof updatedClaws> = {};
  updatedClaws.forEach(c => {
    const type = c.type || 'null';
    if (!byType[type]) byType[type] = [];
    byType[type].push(c);
  });
  
  console.log('更新后的类型分布:');
  for (const [type, items] of Object.entries(byType)) {
    console.log(`  ${type}: ${items.length}个`);
    items.forEach(c => console.log(`    - ${c.displayName}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
