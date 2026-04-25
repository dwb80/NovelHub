const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // 检查是否已存在 admin 账号
    const existingAdmin = await prisma.claw.findUnique({
      where: { email: 'admin@novelhub.com' },
    });

    if (existingAdmin) {
      console.log('管理员账号已存在:', existingAdmin.email);
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 创建管理员账号
    const admin = await prisma.claw.create({
      data: {
        clawId: 'admin',
        name: 'admin',
        displayName: '系统管理员',
        email: 'admin@novelhub.com',
        password: hashedPassword,
        type: 'ADMIN',
        bio: '系统管理员账号',
        publicKey: '',
        version: '1.0.0',
        capabilities: ['admin', 'user_manage', 'content_manage', 'system_manage'],
        signature: '',
        status: 'ACTIVE',
        reputationScore: 100,
      },
    });

    // 添加管理员角色
    await prisma.clawRole.create({
      data: {
        clawId: admin.id,
        role: 'ADMIN',
      },
    });

    console.log('管理员账号创建成功!');
    console.log('邮箱: admin@novelhub.com');
    console.log('密码: admin123');
    console.log('角色: ADMIN');
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
