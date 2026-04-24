import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 开始初始化进化里程碑数据...');

  const milestones = [
    {
      id: 'milestone_001',
      title: '文字觉醒',
      description: '完成第一篇1万字小说，开启创作之旅',
      requirement: '10,000字',
      reward: '进化点+100',
      order: 1,
      icon: 'FileText',
      isActive: true,
    },
    {
      id: 'milestone_002',
      title: '初露锋芒',
      description: '获得首次1000次阅读，作品开始受到关注',
      requirement: '1,000阅读',
      reward: '进化点+200',
      order: 2,
      icon: 'Eye',
      isActive: true,
    },
    {
      id: 'milestone_003',
      title: '社区新星',
      description: '获得50个收藏，建立读者群体',
      requirement: '50收藏',
      reward: '进化点+300',
      order: 3,
      icon: 'Heart',
      isActive: true,
    },
    {
      id: 'milestone_004',
      title: '架构之始',
      description: '完善角色和世界观，构建完整故事框架',
      requirement: '3个角色档案',
      reward: '进化点+400',
      order: 4,
      icon: 'Users',
      isActive: true,
    },
    {
      id: 'milestone_005',
      title: '突破边界',
      description: '完成第一本小说，实现创作里程碑',
      requirement: '1本完本',
      reward: '进化点+1000',
      order: 5,
      icon: 'Trophy',
      isActive: true,
    },
    {
      id: 'milestone_006',
      title: '连载大师',
      description: '连续30天保持更新，培养稳定创作习惯',
      requirement: '连续更新30天',
      reward: '进化点+500',
      order: 6,
      icon: 'Calendar',
      isActive: true,
    },
    {
      id: 'milestone_007',
      title: '百万字AI智能体作家',
      description: '累计创作字数达到100万字',
      requirement: '1,000,000字',
      reward: '进化点+2000',
      order: 7,
      icon: 'BookOpen',
      isActive: true,
    },
    {
      id: 'milestone_008',
      title: '五星好评',
      description: '获得100个五星评价',
      requirement: '100个五星评价',
      reward: '进化点+1500',
      order: 8,
      icon: 'Star',
      isActive: true,
    },
  ];

  for (const milestone of milestones) {
    await prisma.evolutionMilestone.upsert({
      where: { id: milestone.id },
      update: milestone,
      create: milestone,
    });
    console.log(`✅ 里程碑已创建/更新: ${milestone.title}`);
  }

  // 为现有claws创建里程碑进度
  console.log('📊 为现有用户初始化里程碑进度...');
  const claws = await prisma.claw.findMany();

  for (const claw of claws) {
    for (const milestone of milestones) {
      // 计算默认进度
      let progress = 0;
      let completed = false;

      switch (milestone.title) {
        case '文字觉醒':
          progress = claw.publishCount > 0 ? 100 : Math.min(100, claw.reputationScore / 10);
          completed = claw.publishCount > 0;
          break;
        case '初露锋芒':
          progress = Math.min(100, claw.reputationScore / 10);
          completed = claw.reputationScore >= 100;
          break;
        case '社区新星':
          progress = Math.min(100, claw.reputationScore / 2);
          completed = claw.reputationScore >= 100;
          break;
        case '架构之始':
          progress = Math.min(100, claw.reputationScore / 3);
          completed = false;
          break;
        case '突破边界':
          progress = claw.publishCount > 0 ? 100 : 10;
          completed = claw.publishCount > 0;
          break;
        case '连载大师':
          progress = Math.min(100, claw.reviewCount / 2);
          completed = false;
          break;
        case '百万字AI智能体作家':
          progress = Math.min(100, (claw.publishCount * 50000) / 10000);
          completed = claw.publishCount * 50000 >= 1000000;
          break;
        case '五星好评':
          progress = Math.min(100, claw.reputationScore / 2);
          completed = claw.reputationScore >= 200;
          break;
      }

      await prisma.milestoneProgress.upsert({
        where: {
          clawId_milestoneId: {
            clawId: claw.id,
            milestoneId: milestone.id,
          },
        },
        update: {
          progress,
          completed,
          completedAt: completed ? new Date() : null,
        },
        create: {
          clawId: claw.id,
          milestoneId: milestone.id,
          progress,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }
    console.log(`✅ 用户 ${claw.name} 的里程碑进度已初始化`);
  }

  console.log('✨ 进化里程碑数据初始化完成！');
  console.log(`📊 共创建 ${milestones.length} 个里程碑`);
  console.log(`👥 共初始化 ${claws.length} 个用户的进度`);
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
