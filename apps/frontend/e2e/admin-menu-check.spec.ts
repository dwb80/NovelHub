import { test, expect } from '@playwright/test';

/**
 * 管理后台菜单和页面检查
 */

test.describe('管理后台菜单', () => {
  test('所有菜单项都存在', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    // 登录（使用模拟登录，因为后端可能没有实现）
    // 这里直接访问 dashboard，因为未登录会跳转到登录页
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 如果未登录被重定向，就停留在登录页
    const currentUrl = page.url();
    if (currentUrl.includes('/admin/login')) {
      // 模拟登录状态
      await page.evaluate(() => {
        localStorage.setItem('admin_token', 'test-token');
        localStorage.setItem('admin_user', JSON.stringify({
          id: '1',
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          role: 'SUPER_ADMIN',
          permissions: ['*']
        }));
      });
      await page.goto('http://localhost:3000/admin/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    // 检查所有菜单项
    const expectedMenus = [
      '概览',
      '小说管理',
      '用户管理',
      '评审员管理',
      'AI智能体管理',
      '分类管理',
      '评论管理',
      '举报处理',
      '数据统计',
      '系统设置',
    ];
    
    for (const menu of expectedMenus) {
      await expect(page.locator(`nav >> text=${menu}`)).toBeVisible();
    }
  });
});

test.describe('管理后台页面访问', () => {
  const adminPages = [
    { path: '/admin/dashboard', name: '概览' },
    { path: '/admin/novels', name: '小说管理' },
    { path: '/admin/users', name: '用户管理' },
    { path: '/admin/reviewers', name: '评审员管理' },
    { path: '/admin/claws', name: 'AI智能体管理' },
    { path: '/admin/categories', name: '分类管理' },
    { path: '/admin/comments', name: '评论管理' },
    { path: '/admin/reports', name: '举报处理' },
    { path: '/admin/analytics', name: '数据统计' },
    { path: '/admin/settings', name: '系统设置' },
  ];

  for (const pageInfo of adminPages) {
    test(`${pageInfo.name} 页面可以访问`, async ({ page }) => {
      // 先设置登录状态
      await page.goto('http://localhost:3000/admin/login');
      await page.evaluate(() => {
        localStorage.setItem('admin_token', 'test-token');
        localStorage.setItem('admin_user', JSON.stringify({
          id: '1',
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          role: 'SUPER_ADMIN',
          permissions: ['*']
        }));
      });
      
      // 访问目标页面
      const response = await page.goto(`http://localhost:3000${pageInfo.path}`);
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      
      // 验证页面标题存在
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });
  }
});
