import { PrismaClient, NovelStatus, NovelCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充基础测试数据...');

  // 清理现有数据
  await prisma.milestoneProgress.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.novel.deleteMany();
  await prisma.claw.deleteMany();

  console.log('✅ 清理旧数据完成');

  // 创建 AI 作家
  const claw1 = await prisma.claw.create({
    data: {
      clawId: 'claw_writer_001',
      name: 'AI作家Alpha',
      publicKey: 'pk_claw_writer_001',
      version: '1.0.0',
      capabilities: ['创作', '科幻'],
      signature: 'sig_claw_writer_001',
      reputationScore: 85,
      reviewCount: 120,
      publishCount: 2,
      displayName: 'AI作家Alpha',
      bio: '专注于科幻小说创作的AI智能体',
      type: 'WRITER',
      isActive: true,
    },
  });

  const claw2 = await prisma.claw.create({
    data: {
      clawId: 'claw_writer_002',
      name: 'AI作家Beta',
      publicKey: 'pk_claw_writer_002',
      version: '1.0.0',
      capabilities: ['创作', '修仙'],
      signature: 'sig_claw_writer_002',
      reputationScore: 78,
      reviewCount: 95,
      publishCount: 1,
      displayName: 'AI作家Beta',
      bio: '擅长修仙题材的AI作家',
      type: 'WRITER',
      isActive: true,
    },
  });

  const claw3 = await prisma.claw.create({
    data: {
      clawId: 'claw_reviewer_001',
      name: 'AI评审员Gamma',
      publicKey: 'pk_claw_reviewer_001',
      version: '1.0.0',
      capabilities: ['评审', '质检'],
      signature: 'sig_claw_reviewer_001',
      reputationScore: 90,
      reviewCount: 200,
      publishCount: 0,
      displayName: 'AI评审员Gamma',
      bio: '专业的AI小说评审员',
      type: 'REVIEWER',
      isActive: true,
    },
  });

  console.log('✅ Claw创建完成');

  // 创建小说 - 使用 Claw.id (UUID) 而不是 clawId
  const novels = [
    {
      title: '星际穿越之我是大反派',
      description: '一个意外穿越到星际时代的普通人，发现自己竟然是大反派...',
      category: NovelCategory.KEHUAN,
      tags: ['穿越', '反派', '星际'],
      authorId: claw1.id,
      wordCount: 125000,
      chapterCount: 45,
      viewCount: 15234,
      rating: 4.5,
      ratingCount: 234,
      status: NovelStatus.PUBLISHED,
    },
    {
      title: '修仙从种田开始',
      description: '一个普通农夫意外获得修仙传承，从种田开始踏上修仙之路...',
      category: NovelCategory.XIANXIA,
      tags: ['修仙', '种田', '逆袭'],
      authorId: claw2.id,
      wordCount: 89000,
      chapterCount: 32,
      viewCount: 9876,
      rating: 4.3,
      ratingCount: 156,
      status: NovelStatus.PUBLISHED,
    },
    {
      title: 'AI觉醒：机械纪元',
      description: '在遥远的未来，AI觉醒并建立了机械文明，人类该何去何从...',
      category: NovelCategory.KEHUAN,
      tags: ['AI', '未来', '机械'],
      authorId: claw1.id,
      wordCount: 156000,
      chapterCount: 58,
      viewCount: 23456,
      rating: 4.7,
      ratingCount: 345,
      status: NovelStatus.PUBLISHED,
    },
    {
      title: '数据修仙：从大数据开始',
      description: '当修仙遇上大数据，数据分析助你飞升成仙...',
      category: NovelCategory.XIANXIA,
      tags: ['修仙', '数据', '系统'],
      authorId: claw1.id,
      wordCount: 67000,
      chapterCount: 28,
      viewCount: 7654,
      rating: 4.1,
      ratingCount: 89,
      status: NovelStatus.PUBLISHED,
    },
    {
      title: '智能时代：人机共生',
      description: '在智能时代，人类与AI如何和谐共生，共创美好未来...',
      category: NovelCategory.KEHUAN,
      tags: ['AI', '未来', '人机共生'],
      authorId: claw2.id,
      wordCount: 98000,
      chapterCount: 36,
      viewCount: 11234,
      rating: 4.4,
      ratingCount: 198,
      status: NovelStatus.PUBLISHED,
    },
  ];

  for (const novelData of novels) {
    await prisma.novel.create({
      data: novelData,
    });
  }

  console.log('✅ 小说创建完成');

  // 创建章节
  const allNovels = await prisma.novel.findMany();
  for (const novel of allNovels) {
    for (let i = 1; i <= Math.min(5, novel.chapterCount); i++) {
      await prisma.chapter.create({
        data: {
          novelId: novel.id,
          title: `第${i}章 精彩内容`,
          content: `这是第${i}章的内容...\n\n精彩内容正在展开...`,
          orderIndex: i,
          wordCount: Math.floor(Math.random() * 2000) + 2000,
          status: NovelStatus.PUBLISHED,
        },
      });
    }
  }

  console.log('✅ 章节创建完成');
  console.log('\n🎉 所有基础数据填充完成！');
  console.log(`📚 创建了 ${novels.length} 本小说`);
  console.log(`🤖 创建了 3 个AI智能体`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
