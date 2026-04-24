import { PrismaClient, ReportType, ReportStatus, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充管理后台测试数据...');

  // 1. 确保有读者用户用于举报
  const readers = await prisma.readers.findMany({ take: 5 });
  let readerIds = readers.map(r => r.id);
  
  // 如果读者不足，创建更多读者
  if (readers.length < 5) {
    const newReaders = [];
    for (let i = readers.length; i < 5; i++) {
      const reader = await prisma.readers.create({
        data: {
          username: `测试读者${i + 1}`,
          email: `test_reader_${i + 1}@example.com`,
          passwordHash: await bcrypt.hash('reader123', 10),
          readCount: Math.floor(Math.random() * 500) + 10,
          reviewCount: Math.floor(Math.random() * 100),
          commentCount: Math.floor(Math.random() * 200),
        },
      });
      newReaders.push(reader);
    }
    readerIds = [...readerIds, ...newReaders.map(r => r.id)];
  }

  // 2. 确保有Claw用于举报
  const claws = await prisma.claw.findMany({ take: 5 });
  let clawIds = claws.map(c => c.id);

  // 3. 确保有小说用于举报
  const novels = await prisma.novel.findMany({ take: 10 });
  let novelIds = novels.map(n => n.id);

  // 4. 确保有章节用于举报
  const chapters = await prisma.chapter.findMany({ take: 10 });
  let chapterIds = chapters.map(c => c.id);

  // 5. 创建10条举报数据
  const reportReasons = [
    '内容涉及色情低俗，需要处理',
    '包含暴力血腥内容，不适合阅读',
    '侵犯他人版权，涉嫌抄袭',
    '发布虚假信息，误导读者',
    '恶意攻击他人，言语不当',
    '广告垃圾信息，影响体验',
    '内容质量太差，需要改进',
    '抄袭他人作品，情节雷同',
    '违反社区规范，不当言论',
    '其他原因，请管理员查看',
  ];

  const reportTypes: ReportType[] = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'COPYRIGHT', 'VIOLENCE', 'ILLEGAL', 'OTHER'];
  const reportStatuses: ReportStatus[] = ['PENDING', 'RESOLVED', 'REJECTED'];

  // 先检查现有举报数量
  const existingReports = await prisma.report.count();
  if (existingReports < 10) {
    for (let i = existingReports; i < 10; i++) {
      const targetType = i % 4 === 0 ? 'NOVEL' : i % 4 === 1 ? 'CHAPTER' : i % 4 === 2 ? 'COMMENT' : 'USER';
      const reporterId = readerIds[i % readerIds.length];
      const targetId = targetType === 'NOVEL' ? novelIds[i % novelIds.length] : 
                       targetType === 'CHAPTER' ? chapterIds[i % chapterIds.length] :
                       targetType === 'COMMENT' ? `comment_${i}` : 
                       clawIds[i % clawIds.length];
      
      await prisma.report.create({
        data: {
          type: reportTypes[i % reportTypes.length],
          reason: reportReasons[i % reportReasons.length],
          status: reportStatuses[i % reportStatuses.length],
          reporterId: reporterId,
          reporterType: 'READER',
          targetId: targetId,
          targetType: targetType,
          targetTitle: targetType === 'NOVEL' ? `被举报的小说标题${i + 1}` : undefined,
          targetContent: targetType === 'COMMENT' ? `被举报的评论内容${i + 1}` : undefined,
          handledBy: i % 3 !== 0 ? 'admin' : undefined,
          handledAt: i % 3 !== 0 ? new Date(Date.now() - i * 86400000) : undefined,
          result: i % 3 !== 0 ? (i % 2 === 0 ? '已处理该举报' : '经审核无违规，驳回举报') : undefined,
        },
      });
    }
    console.log('✅ 10条举报数据创建完成');
  } else {
    console.log('✅ 举报数据已足够');
  }

  // 6. 创建10条评审任务数据
  const existingTasks = await prisma.reviewTask.count();
  if (existingTasks < 10) {
    // 获取或创建评审员
    let reviewers = await prisma.claw.findMany({
      where: {
        roles: {
          some: {
            role: 'REVIEWER'
          }
        }
      },
      take: 3
    });

    // 如果没有足够的评审员，创建一些
    if (reviewers.length < 3) {
      for (let i = reviewers.length; i < 3; i++) {
        const reviewer = await prisma.claw.create({
          data: {
            clawId: `claw_reviewer_00${i + 2}`,
            name: `评审员${i + 2}`,
            publicKey: `pk_reviewer_${i + 2}_${Date.now()}`,
            version: '1.0.0',
            capabilities: ['评审', '科幻'],
            signature: `sig_reviewer_${i + 2}`,
            reputationScore: 80 + i * 5,
            reviewCount: 100 + i * 50,
            publishCount: 0,
          }
        });
        // 创建角色
        await prisma.clawRole.create({
          data: {
            clawId: reviewer.id,
            role: 'REVIEWER'
          }
        });
        reviewers.push(reviewer);
      }
    }

    // 创建评审任务
    for (let i = existingTasks; i < 10; i++) {
      const status: TaskStatus = i % 3 === 0 ? 'PENDING' : i % 3 === 1 ? 'ASSIGNED' : 'COMPLETED';
      const novelId = novelIds[i % novelIds.length];
      const chapterId = chapterIds[i % chapterIds.length];
      
      await prisma.reviewTask.create({
        data: {
          type: i % 2 === 0 ? 'CHAPTER' : 'NOVEL',
          novelId: novelId,
          chapterId: chapterId,
          status: status,
          assignedTo: status !== 'PENDING' ? reviewers[i % reviewers.length].id : undefined,
          assignedAt: status !== 'PENDING' ? new Date(Date.now() - i * 86400000) : undefined,
          completedAt: status === 'COMPLETED' ? new Date(Date.now() - (i - 2) * 86400000) : undefined,
          requiredCapabilities: ['评审'],
          priority: i % 3,
        },
      });
    }
    console.log('✅ 10条评审任务数据创建完成');
  } else {
    console.log('✅ 评审任务数据已足够');
  }

  // 7. 创建10个读者用户
  const existingReaders = await prisma.readers.count();
  if (existingReaders < 10) {
    for (let i = existingReaders; i < 10; i++) {
      await prisma.reader.create({
        data: {
          username: `读者用户${i + 1}`,
          email: `reader_${i + 1}@novelhub.com`,
          passwordHash: await bcrypt.hash('reader123', 10),
          readCount: Math.floor(Math.random() * 500) + 10,
          reviewCount: Math.floor(Math.random() * 100),
          commentCount: Math.floor(Math.random() * 200),
          lastLoginAt: i % 2 === 0 ? new Date() : null,
        },
      });
    }
    console.log('✅ 10个读者用户创建完成');
  } else {
    console.log('✅ 读者用户数据已足够');
  }

  // 8. 创建10个AI智能体作家 (Claws with AUTHOR role)
  const existingAuthors = await prisma.claw.count({
    where: {
      roles: {
        some: {
          role: 'AUTHOR'
        }
      }
    }
  });
  
  if (existingAuthors < 10) {
    const authorNames = [
      '科幻大师', '玄幻宗师', '都市写手', '历史学者', '游戏达人',
      '悬疑专家', '言情天后', '军事作家', '同人创作者', '仙侠写手'
    ];
    
    for (let i = existingAuthors; i < 10; i++) {
      const claw = await prisma.claw.create({
        data: {
          clawId: `claw_author_${String(i + 1).padStart(3, '0')}`,
          name: authorNames[i % authorNames.length],
          publicKey: `pk_author_${i + 1}_${Date.now()}`,
          version: '1.0.0',
          capabilities: ['创作', '写作'],
          signature: `sig_author_${i + 1}`,
          reputationScore: Math.floor(Math.random() * 500) + 50,
          reviewCount: Math.floor(Math.random() * 100),
          publishCount: Math.floor(Math.random() * 10) + 1,
          isBanned: i % 8 === 0,
        }
      });
      
      // 创建角色
      await prisma.clawRole.create({
        data: {
          clawId: claw.id,
          role: 'AUTHOR'
        }
      });
    }
    console.log('✅ 10个AI智能体作家创建完成');
  } else {
    console.log('✅ AI智能体作家数据已足够');
  }

  // 9. 创建10个AI评审员 (Claws with REVIEWER role)
  const existingReviewers = await prisma.claw.count({
    where: {
      roles: {
        some: {
          role: 'REVIEWER'
        }
      }
    }
  });
  
  if (existingReviewers < 10) {
    const reviewerNames = [
      '严格评审', '温柔评审', '公正评审官', '专业评论家', '资深读者',
      '文学爱好者', '小说达人', '阅读专家', '品味评审', '质量把关'
    ];
    
    const levels = ['NOVICE', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];
    
    for (let i = existingReviewers; i < 10; i++) {
      const reviewer = await prisma.claw.create({
        data: {
          clawId: `claw_reviewer_${String(i + 10).padStart(3, '0')}`,
          name: reviewerNames[i % reviewerNames.length],
          publicKey: `pk_reviewer_${i + 10}_${Date.now()}`,
          version: '1.0.0',
          capabilities: ['评审', '评论'],
          signature: `sig_reviewer_${i + 10}`,
          reputationScore: Math.floor(Math.random() * 1000) + 100,
          reviewCount: Math.floor(Math.random() * 500) + 10,
          publishCount: 0,
          isBanned: i % 7 === 0,
        }
      });

      // 创建角色
      await prisma.clawRole.create({
        data: {
          clawId: reviewer.id,
          role: 'REVIEWER'
        }
      });

      // 创建评审员统计
      await prisma.reviewerStats.create({
        data: {
          clawId: reviewer.id,
          totalReviews: Math.floor(Math.random() * 500) + 10,
          totalScore: Math.floor(Math.random() * 5000),
          currentLevel: levels[i % levels.length],
          avgRating: Math.random() * 5 + 5,
          accuracy: Math.random() * 0.3 + 0.7,
          updatedAt: new Date()
        }
      });

      // 创建评审员分数日志
      await prisma.reviewerScoreLog.create({
        data: {
          clawId: reviewer.id,
          score: Math.floor(Math.random() * 20) - 5,
          balance: Math.floor(Math.random() * 1000),
          description: '完成评审任务',
          type: 'BASE_REVIEW'
        }
      });
    }
    console.log('✅ 10个AI评审员创建完成');
  } else {
    console.log('✅ AI评审员数据已足够');
  }

  // 10. 创建一些读者与Claw的绑定关系
  const allReaders = await prisma.reader.findMany({ take: 10 });
  const allClaws = await prisma.claw.findMany({ take: 10 });
  
  for (let i = 0; i < Math.min(5, allReaders.length); i++) {
    const existingBinding = await prisma.readerClaw.findFirst({
      where: {
        readerId: allReaders[i].id,
        clawId: allClaws[i % allClaws.length].id
      }
    });
    
    if (!existingBinding) {
      await prisma.readerClaw.create({
        data: {
          readerId: allReaders[i].id,
          clawId: allClaws[i % allClaws.length].id
        }
      });
    }
  }
  console.log('✅ 读者与Claw绑定关系创建完成');

  console.log('\n🎉 管理后台测试数据填充完成！');
  console.log('\n数据概览：');
  console.log('  - 举报: 10条 (包含不同状态)');
  console.log('  - 评审任务: 10条 (包含不同状态)');
  console.log('  - 读者用户: 10个');
  console.log('  - AI智能体作家: 10个');
  console.log('  - AI评审员: 10个');
}

main()
  .catch((e) => {
    console.error('填充数据失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
