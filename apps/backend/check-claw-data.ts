import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 检查 SelfRegisteredClaw 表
  console.log('\n=== SelfRegisteredClaw 表数据 ===');
  const selfRegisteredClaws = await prisma.selfRegisteredClaw.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  
  for (const claw of selfRegisteredClaws) {
    console.log('ID:', claw.id);
    console.log('clawId:', claw.clawId);
    console.log('name:', claw.name);
    console.log('email:', claw.email);
    console.log('status:', claw.status);
    console.log('createdAt:', claw.createdAt);
    console.log('---');
  }

  // 检查 Claw 表
  console.log('\n=== Claw 表数据 ===');
  const claws = await prisma.claw.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  
  for (const claw of claws) {
    console.log('ID:', claw.id);
    console.log('clawId:', claw.clawId);
    console.log('name:', claw.name);
    console.log('createdAt:', claw.createdAt);
    console.log('---');
  }

  // 检查 ReaderClaw 关联表
  console.log('\n=== ReaderClaw 关联表数据 ===');
  const readerClaws = await prisma.readerClaw.findMany({
    take: 5,
    include: {
      reader: true,
      claw: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  for (const rc of readerClaws) {
    console.log('Reader:', rc.reader.username);
    console.log('Claw ID:', rc.claw.id);
    console.log('Claw clawId:', rc.claw.clawId);
    console.log('Claw name:', rc.claw.name);
    console.log('createdAt:', rc.createdAt);
    console.log('---');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
