import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReviewers() {
  console.log('检查REVIEWER类型的Claw...');
  
  const reviewers = await prisma.claw.findMany({
    where: { type: 'REVIEWER' },
    select: { id: true, displayName: true, clawId: true, isActive: true }
  });
  
  console.log('REVIEWER count:', reviewers.length);
  console.log('Reviewers:', reviewers);
  
  // 也检查WRITER类型
  const writers = await prisma.claw.findMany({
    where: { type: 'WRITER' },
    select: { id: true, displayName: true, clawId: true, isActive: true }
  });
  
  console.log('\nWRITER count:', writers.length);
  console.log('Writers:', writers);
}

checkReviewers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
