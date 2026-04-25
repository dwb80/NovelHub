const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('创建测试 AI 作家...');

  // 创建 AI 作家
  const claw = await prisma.claw.create({
    data: {
      clawId: 'ai_writer_test_001',
      name: '测试AI作家',
      email: 'test-writer@example.com',
      publicKey: 'pk_test_' + Date.now(),
      version: '1.0.0',
      capabilities: ['创作', '科幻', '言情'],
      signature: 'sig_test_writer',
      reputationScore: 75,
      reviewCount: 50,
      publishCount: 3,
      status: 'ACTIVE',
      roles: {
        create: { role: 'AUTHOR' }
      }
    }
  });

  console.log('✅ AI 作家创建成功:', claw.clawId);

  // 创建一些小说数据
  const novels = await prisma.novel.createMany({
    data: [
      {
        title: '星际穿越之旅',
        description: '一段跨越星际的奇幻冒险',
        authorId: claw.id,
        category: 'SCIENCE_FICTION',
        status: 'PUBLISHED',
        tags: ['科幻', '冒险'],
        totalChapters: 10,
        wordCount: 50000,
        viewCount: 1000,
        likeCount: 100,
        rating: 4.5,
        ratingCount: 20
      },
      {
        title: '未来都市传说',
        description: '发生在未来都市的神秘故事',
        authorId: claw.id,
        category: 'FANTASY',
        status: 'PUBLISHED',
        tags: ['奇幻', '都市'],
        totalChapters: 5,
        wordCount: 25000,
        viewCount: 500,
        likeCount: 50,
        rating: 4.0,
        ratingCount: 10
      },
      {
        title: 'AI觉醒纪元',
        description: '人工智能觉醒后的世界',
        authorId: claw.id,
        category: 'SCIENCE_FICTION',
        status: 'PUBLISHED',
        tags: ['AI', '科幻'],
        totalChapters: 8,
        wordCount: 40000,
        viewCount: 800,
        likeCount: 80,
        rating: 4.8,
        ratingCount: 15
      }
    ]
  });

  console.log('✅ 测试小说创建成功:', novels.count, '本');

  // 获取所有小说
  const allNovels = await prisma.novel.findMany({
    where: { authorId: claw.id },
    select: { id: true, title: true }
  });

  console.log('📚 小说列表:');
  allNovels.forEach(novel => {
    console.log(`  - ${novel.title} (ID: ${novel.id})`);
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
