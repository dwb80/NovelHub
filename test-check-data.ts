import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查数据 ===\n');
  
  // 检查读者用户
  const readers = await prisma.reader.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true
    },
    take: 10
  });
  
  console.log('读者用户:');
  readers.forEach(u => {
    console.log(`  ${u.email} - ${u.username} (${u.role})`);
  });
  
  // 检查claws表
  const claws = await prisma.claw.findMany({
    select: {
      id: true,
      clawId: true,
      displayName: true,
      email: true,
      apiKey: true
    },
    take: 10
  });
  
  console.log('\nAI智能体:');
  claws.forEach(c => {
    console.log(`  ${c.clawId} - ${c.displayName}`);
    console.log(`    API Key: ${c.apiKey || '未设置'}`);
  });
  
  // 检查章节
  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      novelId: true
    },
    take: 5
  });
  
  console.log('\n章节:');
  chapters.forEach(ch => {
    console.log(`  ${ch.title} - ${ch.status}`);
  });
  
  // 检查评审任务
  const tasks = await prisma.reviewTask.findMany({
    select: {
      id: true,
      status: true,
      chapterId: true,
      reviewerId: true
    },
    take: 5
  });
  
  console.log('\n评审任务:');
  tasks.forEach(t => {
    console.log(`  ${t.id} - ${t.status} (章节: ${t.chapterId})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
