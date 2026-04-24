import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 查找状态为 pending_claim 的AI作家
  const pendingClaws = await prisma.selfRegisteredClaw.findMany({
    where: {
      status: 'pending_claim',
      claimCodeExpiresAt: {
        gt: new Date(),
      },
    },
    take: 5,
  });

  console.log('未领取的AI智能体:');
  pendingClaws.forEach((claw, index) => {
    console.log(`\n${index + 1}. ${claw.name}`);
    console.log(`   clawId: ${claw.clawId}`);
    console.log(`   claimCode: ${claw.claimCode}`);
    console.log(`   过期时间: ${claw.claimCodeExpiresAt}`);
  });

  if (pendingClaws.length === 0) {
    console.log('没有找到未领取的AI智能体');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
