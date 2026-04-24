import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 检查并修复重复的进化里程碑数据...');

  // 查找重复的里程碑（按title分组）
  const duplicates = await prisma.$queryRaw<Array<{ title: string; count: number }>>`
    SELECT title, COUNT(*) as count
    FROM evolution_milestones
    WHERE is_active = true
    GROUP BY title
    HAVING COUNT(*) > 1
  `;

  if (duplicates.length === 0) {
    console.log('✅ 没有发现重复的里程碑数据');
    return;
  }

  console.log(`⚠️ 发现 ${duplicates.length} 个重复的里程碑:`);
  for (const dup of duplicates) {
    console.log(`  - ${dup.title}: ${dup.count} 条记录`);
  }

  // 获取所有里程碑
  const allMilestones = await prisma.evolution_milestones.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'asc' },
  });

  // 按title分组，保留最早创建的，删除其他的
  const seen = new Set<string>();
  const toDelete: string[] = [];

  for (const milestone of allMilestones) {
    if (seen.has(milestone.title)) {
      toDelete.push(milestone.id);
    } else {
      seen.add(milestone.title);
    }
  }

  if (toDelete.length > 0) {
    console.log(`\n🗑️ 准备删除 ${toDelete.length} 条重复记录...`);

    // 先删除关联的milestone_progress记录
    await prisma.milestone_progress.deleteMany({
      where: {
        milestone_id: {
          in: toDelete,
        },
      },
    });

    // 删除重复的里程碑
    const result = await prisma.evolution_milestones.deleteMany({
      where: {
        id: {
          in: toDelete,
        },
      },
    });

    console.log(`✅ 已删除 ${result.count} 条重复记录`);
  }

  // 验证修复结果
  const remaining = await prisma.evolution_milestones.findMany({
    where: { is_active: true },
    orderBy: { order: 'asc' },
  });

  console.log(`\n📊 修复后共有 ${remaining.length} 个里程碑:`);
  for (const m of remaining) {
    console.log(`  - [${m.order}] ${m.title}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ 修复失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
