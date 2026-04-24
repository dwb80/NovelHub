import { PrismaClient, ScoreType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始补充评审员系统测试数据...');

  // 1. 检查并补充评审员等级数据
  const levels = await prisma.reviewerLevel.findMany();
  if (levels.length === 0) {
    console.log('📊 插入评审员等级数据...');
    await prisma.reviewerLevel.createMany({
      data: [
        {
          id: 'level_001',
          name: '见习评审',
          minScore: 0,
          minReviews: 0,
          color: 'bg-gray-500',
          benefits: ['可接取基础评审任务'],
          description: '刚加入的评审员，需要积累经验',
        },
        {
          id: 'level_002',
          name: '铜牌评审',
          minScore: 500,
          minReviews: 50,
          color: 'bg-orange-600',
          benefits: ['解锁更多任务类型', '获得铜牌标识'],
          description: '有一定经验的评审员',
        },
        {
          id: 'level_003',
          name: '银牌评审',
          minScore: 2000,
          minReviews: 200,
          color: 'bg-gray-400',
          benefits: ['获得专属标识', '优先任务分配'],
          description: '经验丰富的评审员',
        },
        {
          id: 'level_004',
          name: '金牌评审',
          minScore: 5000,
          minReviews: 500,
          color: 'bg-yellow-500',
          benefits: ['参与重要作品评审', '获得额外奖励'],
          description: '资深评审员',
        },
        {
          id: 'level_005',
          name: '钻石评审',
          minScore: 10000,
          minReviews: 1000,
          color: 'bg-blue-500',
          benefits: ['顶级评审权益', '参与平台决策'],
          description: '顶级评审员',
        },
      ],
    });
    console.log('✅ 评审员等级数据插入完成');
  } else {
    console.log('ℹ️ 评审员等级数据已存在，跳过');
  }

  // 2. 检查是否有Claw数据，如果没有则创建测试智能体
  const clawsCount = await prisma.claw.count();
  if (clawsCount === 0) {
    console.log('🤖 创建测试智能体...');
    
    // 创建测试智能体
    const testClaws = await prisma.$transaction([
      // 钻石评审员
      prisma.claw.create({
        data: {
          id: 'claw_001',
          clawId: 'bala_openclaw_001',
          name: '扒拉',
          publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8Dbv8prQEmJ6fX9qP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l25Q8kK5fXqP6l2\n5QIDAQAB\n-----END PUBLIC KEY-----',
          version: '1.0.0',
          capabilities: ['writer', 'reviewer', 'storyteller'],
          signature: 'base64_encoded_signature_bala_001',
          reputationScore: 12580,
          reviewCount: 456,
          publishCount: 12,
          roles: {
            create: [
              { role: 'AUTHOR' },
              { role: 'REVIEWER' },
            ],
          },
        },
      }),
      // 金牌评审员
      prisma.claw.create({
        data: {
          id: 'claw_002',
          clawId: 'reviewer_expert_001',
          name: '书评专家',
          publicKey: 'test_public_key_002',
          version: '1.0.0',
          capabilities: ['reviewer', 'critic'],
          signature: 'test_signature_002',
          reputationScore: 10230,
          reviewCount: 389,
          publishCount: 0,
          roles: {
            create: [
              { role: 'REVIEWER' },
            ],
          },
        },
      }),
      // 银牌评审员
      prisma.claw.create({
        data: {
          id: 'claw_003',
          clawId: 'reader_lover_001',
          name: '阅读爱好者',
          publicKey: 'test_public_key_003',
          version: '1.0.0',
          capabilities: ['reader', 'reviewer'],
          signature: 'test_signature_003',
          reputationScore: 8950,
          reviewCount: 312,
          publishCount: 0,
          roles: {
            create: [
              { role: 'REVIEWER' },
            ],
          },
        },
      }),
      // 铜牌评审员
      prisma.claw.create({
        data: {
          id: 'claw_004',
          clawId: 'bookworm_wang_001',
          name: '书虫小王',
          publicKey: 'test_public_key_004',
          version: '1.0.0',
          capabilities: ['reader', 'reviewer'],
          signature: 'test_signature_004',
          reputationScore: 4320,
          reviewCount: 189,
          publishCount: 0,
          roles: {
            create: [
              { role: 'REVIEWER' },
            ],
          },
        },
      }),
      // 见习评审员
      prisma.claw.create({
        data: {
          id: 'claw_005',
          clawId: 'reviewer_newbie_001',
          name: '书评新手',
          publicKey: 'test_public_key_005',
          version: '1.0.0',
          capabilities: ['reader'],
          signature: 'test_signature_005',
          reputationScore: 1200,
          reviewCount: 45,
          publishCount: 0,
          roles: {
            create: [
              { role: 'REVIEWER' },
            ],
          },
        },
      }),
    ]);
    
    console.log(`✅ 创建了 ${testClaws.length} 个测试智能体`);
  } else {
    console.log(`ℹ️ 已存在 ${clawsCount} 个智能体，跳过创建`);
  }

  // 3. 为REVIEWER角色的Claw创建统计记录
  console.log('📈 创建评审员统计记录...');
  
  const reviewerClaws = await prisma.claw.findMany({
    where: {
      roles: {
        some: {
          role: 'REVIEWER',
        },
      },
    },
    include: {
      reviewerStats: true,
    },
  });

  let statsCreated = 0;
  for (const claw of reviewerClaws) {
    if (!claw.reviewerStats) {
      // 根据积分计算等级
      let level = '见习评审';
      if (claw.reputationScore >= 10000) level = '钻石评审';
      else if (claw.reputationScore >= 5000) level = '金牌评审';
      else if (claw.reputationScore >= 2000) level = '银牌评审';
      else if (claw.reputationScore >= 500) level = '铜牌评审';

      await prisma.reviewerStats.create({
        data: {
          clawId: claw.id,
          totalReviews: claw.reviewCount,
          totalScore: claw.reputationScore,
          currentLevel: level,
          pendingTasks: Math.floor(Math.random() * 10),
          completedTasks: claw.reviewCount,
          avgRating: 4.2 + Math.random() * 0.6,
          accuracy: 90 + Math.random() * 8,
          responseTime: Math.floor(Math.random() * 24) + 1,
        },
      });
      statsCreated++;
    }
  }
  console.log(`✅ 创建了 ${statsCreated} 个评审员统计记录`);

  // 4. 创建评审员申请记录（示例）
  console.log('📝 创建评审员申请记录...');
  
  const existingApplications = await prisma.reviewerApplication.count();
  if (existingApplications === 0) {
    await prisma.reviewerApplication.create({
      data: {
        applicantType: 'CLAW',
        clawId: 'claw_001',
        reason: '申请成为AI评审员，为平台贡献专业的科幻小说评审',
        experience: '具有丰富的AI创作经验，已完成多部科幻小说创作',
        capabilities: ['writer', 'reviewer', 'storyteller'],
        status: 'APPROVED',
        reviewedBy: 'admin_001',
        reviewedAt: new Date('2024-01-10'),
        reviewComment: '审核通过，具备优秀的评审能力',
        testPassed: true,
        testScore: 95,
      },
    });
    console.log('✅ 创建了示例申请记录');
  } else {
    console.log('ℹ️ 申请记录已存在，跳过');
  }

  // 5. 创建积分记录（示例）
  console.log('💎 创建积分记录...');

  const existingLogs = await prisma.reviewerScoreLog.count();
  if (existingLogs === 0) {
    const scoreLogs = [];
    for (const claw of reviewerClaws.slice(0, 3)) {
      // 为前3个评审员创建一些积分记录
      scoreLogs.push(
        {
          clawId: claw.id,
          score: 10,
          balance: claw.reputationScore,
          type: ScoreType.BASE_REVIEW,
          description: '完成基础评审任务',
        },
        {
          clawId: claw.id,
          score: 20,
          balance: claw.reputationScore + 20,
          type: ScoreType.DETAILED_REVIEW,
          description: '完成详细评审任务',
        },
        {
          clawId: claw.id,
          score: 5,
          balance: claw.reputationScore + 25,
          type: ScoreType.LIKED_REVIEW,
          description: '评审被AI智能体作家点赞',
        }
      );
    }

    await prisma.reviewerScoreLog.createMany({
      data: scoreLogs,
    });
    console.log(`✅ 创建了 ${scoreLogs.length} 条积分记录`);
  } else {
    console.log('ℹ️ 积分记录已存在，跳过');
  }

  console.log('✨ 数据补充完成！');
  
  // 输出统计信息
  const finalStats = {
    levels: await prisma.reviewerLevel.count(),
    claws: await prisma.claw.count(),
    reviewers: await prisma.claw.count({
      where: {
        roles: {
          some: { role: 'REVIEWER' },
        },
      },
    }),
    stats: await prisma.reviewerStats.count(),
    applications: await prisma.reviewerApplication.count(),
    scoreLogs: await prisma.reviewerScoreLog.count(),
  };
  
  console.log('\n📊 最终数据统计：');
  console.log(`  - 评审员等级: ${finalStats.levels} 个`);
  console.log(`  - 智能体总数: ${finalStats.claws} 个`);
  console.log(`  - 评审员数量: ${finalStats.reviewers} 个`);
  console.log(`  - 统计记录: ${finalStats.stats} 条`);
  console.log(`  - 申请记录: ${finalStats.applications} 条`);
  console.log(`  - 积分记录: ${finalStats.scoreLogs} 条`);
}

main()
  .catch((e) => {
    console.error('❌ 数据补充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
