import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 生成邀请码
 * 格式: CLAW-XXXX-XXXX-XXXX (16位随机字符)
 */
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'CLAW-';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) code += '-';
  }
  return code;
}

/**
 * 生成单个邀请码
 */
async function generateInvitationCodeRecord(
  agentType: 'writer' | 'reviewer',
  remark?: string,
) {
  const code = generateInvitationCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30天过期

  const record = await prisma.selfRegisteredClaw.create({
    data: {
      clawId: code,
      name: `Invitation-${agentType}-${Date.now()}`,
      publicKey: '', // 邀请码阶段还没有公钥
      clawType: agentType.toUpperCase(),
      claimCode: crypto.randomUUID(),
      claimCodeExpiresAt: expiresAt,
      status: 'INVITATION_UNUSED', // 邀请码未使用状态
      email: `invitation-${code.toLowerCase().replace(/-/g, '')}@placeholder.com`,
      emailVerified: false,
      metadata: {
        remark: remark || '',
        isInvitationCode: true,
        createdBy: 'admin-script',
      },
    },
  });

  return {
    code: record.clawId,
    agentType: record.clawType.toLowerCase() as 'writer' | 'reviewer',
    createdAt: record.createdAt.toISOString(),
    expiresAt: record.claimCodeExpiresAt?.toISOString() || '',
    status: 'unused' as const,
    remark: (record.metadata as any)?.remark,
  };
}

/**
 * 批量生成邀请码
 */
async function batchGenerateInvitationCodes() {
  const results = {
    writers: [] as any[],
    reviewers: [] as any[],
  };

  console.log('\n========================================');
  console.log('  批量生成邀请码工具 (直接数据库操作)');
  console.log('========================================\n');

  console.log('开始生成邀请码...\n');

  // 生成10个AI作家邀请码
  console.log('【1/2】生成AI作家邀请码 (10个)...');
  for (let i = 1; i <= 10; i++) {
    try {
      const result = await generateInvitationCodeRecord('writer', `AI作家邀请码 #${i}`);
      results.writers.push(result);
      console.log(`  ✓ 已生成: ${result.code}`);
    } catch (error) {
      console.error(`  ✗ 生成失败 #${i}:`, error);
    }
  }

  // 生成10个AI评审员邀请码
  console.log('\n【2/2】生成AI评审员邀请码 (10个)...');
  for (let i = 1; i <= 10; i++) {
    try {
      const result = await generateInvitationCodeRecord('reviewer', `AI评审员邀请码 #${i}`);
      results.reviewers.push(result);
      console.log(`  ✓ 已生成: ${result.code}`);
    } catch (error) {
      console.error(`  ✗ 生成失败 #${i}:`, error);
    }
  }

  // 输出结果
  console.log('\n========================================');
  console.log('  生成结果汇总');
  console.log('========================================\n');

  console.log(`AI作家邀请码: ${results.writers.length} 个`);
  results.writers.forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.code}`);
  });

  console.log(`\nAI评审员邀请码: ${results.reviewers.length} 个`);
  results.reviewers.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.code}`);
  });

  console.log('\n========================================');
  console.log('  使用说明');
  console.log('========================================');
  console.log('1. 以上邀请码已保存到数据库');
  console.log('2. 可以在管理后台查看: http://localhost:3003/admin/invitation-codes');
  console.log('3. 智能体可以使用邀请码自助申请ID');
  console.log('4. 邀请码有效期30天，一次性使用');
  console.log('========================================\n');

  // 返回一个可用的邀请码给智能体使用
  if (results.reviewers.length > 0) {
    console.log('【给智能体的邀请码】');
    console.log(`  ${results.reviewers[0].code}`);
    console.log('\n请复制上面的邀请码给智能体使用！\n');
  }

  return results;
}

// 执行批量生成
batchGenerateInvitationCodes()
  .then(async (results) => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n生成失败:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
