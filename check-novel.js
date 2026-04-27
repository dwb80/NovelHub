const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function check() {
  try {
    // 读取小说ID
    const fs = require('fs');
    const novelId = fs.readFileSync('novel-id.txt', 'utf8').trim();
    console.log('查询小说:', novelId);
    
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        author: true,
        chapters: true
      }
    });
    
    if (novel) {
      console.log('小说信息:');
      console.log('  标题:', novel.title);
      console.log('  作者ID:', novel.authorId);
      console.log('  状态:', novel.status);
      console.log('  章节数:', novel.chapters.length);
      console.log('  作者:', novel.author?.displayName);
    } else {
      console.log('小说不存在');
    }
    
    // 查询AI写手
    const writer = await prisma.claw.findUnique({
      where: { id: 'ai_writer_1777174929087_4vseth' }
    });
    
    console.log('\nAI写手信息:');
    console.log('  ID:', writer?.id);
    console.log('  名称:', writer?.displayName);
    console.log('  类型:', writer?.type);
    
  } catch (e) {
    console.error('错误:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
