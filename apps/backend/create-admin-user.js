const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 检查是否已存在 admin 账号
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      console.log('管理员账号已存在:', existingAdmin.username);
      console.log('邮箱:', existingAdmin.email);
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 创建管理员账号
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        name: '系统管理员',
        email: 'admin@novelhub.com',
        passwordHash: hashedPassword,
        avatar: null,
        permissions: ['user:manage', 'content:moderate', 'system:settings', 'admin:manage'],
        isSuperAdmin: true,
        loginAttempts: 0,
        isDeleted: false,
        isBanned: false,
      },
    });

    console.log('管理员账号创建成功!');
    console.log('用户名: admin');
    console.log('邮箱: admin@novelhub.com');
    console.log('密码: admin123');
    console.log('ID:', admin.id);
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
