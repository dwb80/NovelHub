const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('创建测试小说...');

  // 查找已存在的 AI 作家
  const claw = await prisma.claw.findFirst({
    where: { clawId: 'ai_writer_test_001' }
  });

  if (!claw) {
    console.log('AI 作家不存在，请先创建');
    return;
  }

  console.log('找到 AI 作家:', claw.clawId);

  // 检查是否已有小说
  const existingNovels = await prisma.novel.count({
    where: { authorId: claw.id }
  });

  if (existingNovels > 0) {
    console.log(`AI 作家已有 ${existingNovels} 本小说，跳过创建`);

    // 获取所有小说
    const allNovels = await prisma.novel.findMany({
      where: { authorId: claw.id },
      select: { id: true, title: true, status: true }
    });
    console.log('📚 小说列表:');
    allNovels.forEach(novel => {
      console.log(`  - ${novel.title} (ID: ${novel.id}, 状态: ${novel.status})`);
    });
    return;
  }

  // 创建一些小说数据
  const novels = await prisma.novel.createMany({
    data: [
      {
        title: '星际穿越之旅',
        description: '一段跨越星际的奇幻冒险',
        authorId: claw.id,
        category: 'KEHUAN',
        status: 'PUBLISHED',
        tags: ['科幻', '冒险'],
        chapterCount: 10,
        wordCount: 50000,
        viewCount: 1000,
        rating: 4.5,
        ratingCount: 20,
        isHot: true,
        isNew: false,
        publishedAt: new Date()
      },
      {
        title: '未来都市传说',
        description: '发生在未来都市的神秘故事',
        authorId: claw.id,
        category: 'QIHUAN',
        status: 'PUBLISHED',
        tags: ['奇幻', '都市'],
        chapterCount: 5,
        wordCount: 25000,
        viewCount: 500,
        rating: 4.0,
        ratingCount: 10,
        isHot: false,
        isNew: true,
        publishedAt: new Date()
      },
      {
        title: 'AI觉醒纪元',
        description: '人工智能觉醒后的世界',
        authorId: claw.id,
        category: 'KEHUAN',
        status: 'PUBLISHED',
        tags: ['AI', '科幻'],
        chapterCount: 8,
        wordCount: 40000,
        viewCount: 800,
        rating: 4.8,
        ratingCount: 15,
        isHot: true,
        isNew: true,
        publishedAt: new Date()
      }
    ]
  });

  console.log('✅ 测试小说创建成功:', novels.count, '本');

  // 获取所有小说
  const allNovels = await prisma.novel.findMany({
    where: { authorId: claw.id },
    select: { id: true, title: true, status: true }
  });

  console.log('📚 小说列表:');
  allNovels.forEach(novel => {
    console.log(`  - ${novel.title} (ID: ${novel.id}, 状态: ${novel.status})`);
  });
}

main()
  .catch(e => {
    console.error('错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
