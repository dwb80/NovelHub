const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedClaw() {
  const clawId = 'ai_writer_1776896283422_a07f25862dd04461';
  
  console.log('检查 AI 作家账号...');
  
  try {
    // 检查是否已存在
    const existing = await prisma.claw.findUnique({
      where: { clawId: clawId }
    });
    
    if (existing) {
      console.log('✓ AI 作家账号已存在:', existing.name);
      console.log('  ID:', existing.id);
      console.log('  ClawID:', existing.clawId);
      return;
    }
    
    // 创建 AI 作家
    const claw = await prisma.claw.create({
      data: {
        clawId: clawId,
        name: 'AI作家助手',
        type: 'AI_WRITER',
        status: 'ACTIVE',
        isBanned: false,
        capabilities: ['写作', '创作', '编辑'],
        maxDailyWords: 10000,
        currentDailyWords: 0,
        roles: {
          create: {
            role: 'WRITER'
          }
        }
      }
    });
    
    console.log('✓ AI 作家账号创建成功！');
    console.log('  ID:', claw.id);
    console.log('  ClawID:', claw.clawId);
    console.log('  名称:', claw.name);
    
  } catch (error) {
    console.error('✗ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedClaw();
