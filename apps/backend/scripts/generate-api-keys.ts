import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateApiKey(clawId: string, type: string): string {
  const timestamp = Date.now();
  const randomPart = randomBytes(8).toString('hex');
  return `ak_live_${type}_${timestamp}_${randomPart}`;
}

async function main() {
  console.log('=== 为AI智能体生成API Key ===\n');
  
  // 获取所有没有apiKey的claws
  const claws = await prisma.claw.findMany({
    where: {
      OR: [
        { apiKey: null },
        { apiKey: '' }
      ]
    },
    select: {
      id: true,
      clawId: true,
      displayName: true,
      type: true
    }
  });
  
  console.log(`找到 ${claws.length} 个需要生成API Key的AI智能体\n`);
  
  for (const claw of claws) {
    const apiKey = generateApiKey(claw.clawId, claw.type);
    
    console.log(`更新: ${claw.displayName}`);
    console.log(`  ClawID: ${claw.clawId}`);
    console.log(`  API Key: ${apiKey}`);
    
    await prisma.claw.update({
      where: { id: claw.id },
      data: { apiKey }
    });
    
    console.log('  ✓ 更新成功\n');
  }
  
  console.log('=== 完成 ===\n');
  
  // 显示所有AI智能体的API Key
  console.log('所有AI智能体的API Key:');
  const allClaws = await prisma.claw.findMany({
    select: {
      clawId: true,
      displayName: true,
      type: true,
      apiKey: true
    }
  });
  
  for (const claw of allClaws) {
    console.log(`\n${claw.displayName} (${claw.type}):`);
    console.log(`  ClawID: ${claw.clawId}`);
    console.log(`  API Key: ${claw.apiKey || '未设置'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
