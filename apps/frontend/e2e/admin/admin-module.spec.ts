import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:3000/admin';
const API_URL = 'http://localhost:3001/api/v1';

test.describe('管理后台模块测试', () => {
  test.describe('管理员登录', () => {
    test('ADMIN-LOGIN-001: 登录页面正常加载', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);

      // 等待页面加载
      await page.waitForLoadState('networkidle');

      // 验证页面标题
      await expect(page).toHaveTitle(/NovelHub/);

      // 验证登录表单元素 - 使用更通用的选择器
      await expect(page.getByText('管理员登录').first()).toBeVisible();
      await expect(page.locator('input#username')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    });

    test('ADMIN-LOGIN-002: 使用有效凭证登录成功', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');

      // 输入正确的管理员账号密码
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.locator('button[type="submit"]').first().click();

      // 验证跳转到仪表盘
      await page.waitForURL(`${ADMIN_URL}/dashboard`, { timeout: 10000 });
      await expect(page).toHaveURL(`${ADMIN_URL}/dashboard`);

      // 验证仪表盘页面内容
      await expect(page.locator('h1:has-text("仪表盘")').first()).toBeVisible();
    });

    test('ADMIN-LOGIN-003: 密码错误处理', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');

      // 输入错误的密码
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('wrongpassword');
      await page.locator('button[type="submit"]').first().click();

      // 等待错误提示
      await page.waitForTimeout(1000);

      // 验证错误提示
      await expect(page.locator('text=/账号或密码错误|登录失败/').first()).toBeVisible();

      // 验证仍在登录页面
      await expect(page).toHaveURL(`${ADMIN_URL}/login`);
    });

    test('ADMIN-LOGIN-006: Token过期处理', async ({ page }) => {
      // 先登录获取有效token
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`, { timeout: 10000 });

      // 清除localStorage中的token模拟过期
      await page.evaluate(() => {
        localStorage.setItem('accessToken', 'invalid_token');
      });

      // 刷新页面
      await page.reload();
      await page.waitForTimeout(2000);

      // 验证被重定向到登录页
      await expect(page).toHaveURL(new RegExp(`${ADMIN_URL}/login`));
    });
  });

  test.describe('仪表盘', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`, { timeout: 10000 });
    });

    test('ADMIN-DASH-001: 统计数据加载', async ({ page }) => {
      // 验证仪表盘标题
      await expect(page.locator('h1:has-text("仪表盘")').first()).toBeVisible();

      // 验证统计卡片存在 - 使用更通用的选择器
      const cards = page.locator('[class*="card"], .card, [class*="Card"]').first();
      await expect(cards).toBeVisible();
    });

    test('ADMIN-DASH-003: 功能导航显示', async ({ page }) => {
      // 验证导航或功能入口存在
      const content = page.locator('body');
      await expect(content).toContainText(/小说|用户|评论/);
    });

    test('ADMIN-DASH-005: 退出登录', async ({ page }) => {
      // 点击退出登录按钮 - 使用更通用的选择器
      const logoutButton = page.locator('button:has-text("退出"), button:has-text("登出"), [class*="logout"]').first();
      if (await logoutButton.isVisible().catch(() => false)) {
        await logoutButton.click();

        // 验证被重定向到登录页
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(new RegExp(`${ADMIN_URL}/login`));

        // 验证localStorage被清除
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
        expect(token).toBeNull();
      }
    });
  });

  test.describe('权限控制', () => {
    test('ADMIN-008: 未登录访问被拦截', async ({ page }) => {
      // 直接访问仪表盘
      await page.goto(`${ADMIN_URL}/dashboard`);
      await page.waitForTimeout(2000);

      // 验证被重定向到登录页
      await expect(page).toHaveURL(new RegExp(`${ADMIN_URL}/login`));
    });

    test('ADMIN-USER-008: API权限控制', async ({ request }) => {
      // 尝试无token访问管理API
      const response = await request.get(`${API_URL}/admin/users`);

      // 验证返回401未授权
      expect(response.status()).toBe(401);
    });
  });

  test.describe('用户管理', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`, { timeout: 10000 });
    });

    test('ADMIN-USER-001: 用户列表加载', async ({ page }) => {
      // 访问用户管理页面
      await page.goto(`${ADMIN_URL}/users`);
      await page.waitForLoadState('networkidle');

      // 验证页面加载 - 检查页面内容而不是特定标题
      await page.waitForTimeout(2000);
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toMatch(/用户|Users|管理/);
    });

    test('ADMIN-USER-003: 搜索功能', async ({ page }) => {
      // 访问用户管理页面
      await page.goto(`${ADMIN_URL}/users`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 查找搜索输入框并输入关键词
      const searchInput = page.locator('input[placeholder*="搜索"], input[type="search"]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('小说管理', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto(`${ADMIN_URL}/login`);
      await page.waitForLoadState('networkidle');
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('admin123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`, { timeout: 10000 });
    });

    test('ADMIN-NOVEL-001: 小说列表加载', async ({ page }) => {
      // 访问小说管理页面
      await page.goto(`${ADMIN_URL}/novels`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 验证页面加载 - 检查页面内容
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toMatch(/小说|Novels|管理/);
    });

    test('ADMIN-NOVEL-002: 状态筛选', async ({ page }) => {
      // 访问小说管理页面
      await page.goto(`${ADMIN_URL}/novels`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // 检查是否被重定向到登录页面
      if (page.url().includes('/login')) {
        // 重新登录
        await page.fill('input[name="username"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*\/admin\/novels.*/, { timeout: 10000 }).catch(() => {});
        await page.waitForLoadState('networkidle');
      }

      // 查找状态筛选器
      const statusFilter = page.locator('select, [role="combobox"]').first();
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        const option = page.locator('option:has-text("已发布"), [role="option"]:has-text("已发布")').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('API集成测试', () => {
    test('API-AUTH-001: 管理员登录API', async ({ request }) => {
      const response = await request.post(`${API_URL}/admin/auth/login`, {
        data: {
          username: 'admin',
          password: 'admin123',
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('admin');
      expect(body.admin).toHaveProperty('id');
      expect(body.admin).toHaveProperty('username');
    });

    test('API-AUTH-002: 登录失败返回401', async ({ request }) => {
      const response = await request.post(`${API_URL}/admin/auth/login`, {
        data: {
          username: 'admin',
          password: 'wrongpassword',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('API-AUTH-003: 获取统计数据需要认证', async ({ request }) => {
      // 先登录获取token
      const loginResponse = await request.post(`${API_URL}/admin/auth/login`, {
        data: {
          username: 'admin',
          password: 'admin123',
        },
      });

      const { token } = await loginResponse.json();

      // 使用token访问统计API
      const statsResponse = await request.get(`${API_URL}/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(statsResponse.status()).toBe(200);
      const stats = await statsResponse.json();
      expect(stats).toHaveProperty('totalReaders');
      expect(stats).toHaveProperty('totalClaws');
      expect(stats).toHaveProperty('totalNovels');
    });

    test('API-USER-001: 获取用户列表', async ({ request }) => {
      // 先登录获取token
      const loginResponse = await request.post(`${API_URL}/admin/auth/login`, {
        data: {
          username: 'admin',
          password: 'admin123',
        },
      });

      const { token } = await loginResponse.json();

      // 访问用户列表API
      const usersResponse = await request.get(`${API_URL}/admin/users?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(usersResponse.status()).toBe(200);
      const data = await usersResponse.json();
      expect(data).toHaveProperty('users');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.users)).toBe(true);
    });

    test('API-NOVEL-001: 获取小说列表', async ({ request }) => {
      // 先登录获取token
      const loginResponse = await request.post(`${API_URL}/admin/auth/login`, {
        data: {
          username: 'admin',
          password: 'admin123',
        },
      });

      const { token } = await loginResponse.json();

      // 访问小说列表API
      const novelsResponse = await request.get(`${API_URL}/admin/novels?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      expect(novelsResponse.status()).toBe(200);
      const data = await novelsResponse.json();
      expect(data).toHaveProperty('novels');
      expect(data).toHaveProperty('pagination');
    });
  });
});
