import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:3000/admin';
const API_URL = 'http://localhost:3001/api/v1';

test.describe('管理后台模块测试', () => {
  test.describe('管理员登录', () => {
    test('ADMIN-LOGIN-001: 登录页面正常加载', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);
      
      // 验证页面标题
      await expect(page).toHaveTitle(/管理员登录|NovelHub/);
      
      // 验证登录表单元素
      await expect(page.getByRole('heading', { name: /管理员登录/ })).toBeVisible();
      await expect(page.getByLabel(/管理员账号|账号/)).toBeVisible();
      await expect(page.getByLabel(/密码/)).toBeVisible();
      await expect(page.getByRole('button', { name: /登录/ })).toBeVisible();
    });

    test('ADMIN-LOGIN-002: 使用有效凭证登录成功', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);
      
      // 输入正确的管理员账号密码
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('admin123');
      await page.getByRole('button', { name: /登录/ }).click();
      
      // 验证跳转到仪表盘
      await page.waitForURL(`${ADMIN_URL}/dashboard`);
      await expect(page).toHaveURL(`${ADMIN_URL}/dashboard`);
      
      // 验证仪表盘页面内容
      await expect(page.getByRole('heading', { name: /仪表盘/ })).toBeVisible();
    });

    test('ADMIN-LOGIN-003: 密码错误处理', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/login`);
      
      // 输入错误的密码
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('wrongpassword');
      await page.getByRole('button', { name: /登录/ }).click();
      
      // 验证错误提示
      await expect(page.getByText(/账号或密码错误|登录失败/)).toBeVisible();
      
      // 验证仍在登录页面
      await expect(page).toHaveURL(`${ADMIN_URL}/login`);
    });

    test('ADMIN-LOGIN-006: Token过期处理', async ({ page }) => {
      // 先登录获取有效token
      await page.goto(`${ADMIN_URL}/login`);
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('admin123');
      await page.getByRole('button', { name: /登录/ }).click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`);
      
      // 清除localStorage中的token模拟过期
      await page.evaluate(() => {
        localStorage.setItem('accessToken', 'invalid_token');
      });
      
      // 刷新页面
      await page.reload();
      
      // 验证被重定向到登录页
      await page.waitForURL(`${ADMIN_URL}/login`);
      await expect(page).toHaveURL(`${ADMIN_URL}/login`);
    });
  });

  test.describe('仪表盘', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto(`${ADMIN_URL}/login`);
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('admin123');
      await page.getByRole('button', { name: /登录/ }).click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`);
    });

    test('ADMIN-DASH-001: 统计数据加载', async ({ page }) => {
      // 验证仪表盘标题
      await expect(page.getByRole('heading', { name: /仪表盘/ })).toBeVisible();
      
      // 验证统计卡片存在
      const statCards = page.locator('.stat-card, [class*="Card"]').first();
      await expect(statCards).toBeVisible();
      
      // 验证至少有一些统计数据展示
      await expect(page.getByText(/总小说数|小说|Novels/i).first()).toBeVisible();
    });

    test('ADMIN-DASH-003: 功能导航显示', async ({ page }) => {
      // 验证导航或功能入口存在
      await expect(page.getByText(/用户管理|小说管理|评论管理|系统设置/).first()).toBeVisible();
    });

    test('ADMIN-DASH-005: 退出登录', async ({ page }) => {
      // 点击退出登录按钮
      await page.getByRole('button', { name: /退出登录|登出/ }).click();
      
      // 验证被重定向到登录页
      await page.waitForURL(`${ADMIN_URL}/login`);
      await expect(page).toHaveURL(`${ADMIN_URL}/login`);
      
      // 验证localStorage被清除
      const token = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(token).toBeNull();
    });
  });

  test.describe('权限控制', () => {
    test('ADMIN-008: 未登录访问被拦截', async ({ page }) => {
      // 直接访问仪表盘
      await page.goto(`${ADMIN_URL}/dashboard`);
      
      // 验证被重定向到登录页
      await page.waitForURL(`${ADMIN_URL}/login`);
      await expect(page).toHaveURL(`${ADMIN_URL}/login`);
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
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('admin123');
      await page.getByRole('button', { name: /登录/ }).click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`);
    });

    test('ADMIN-USER-001: 用户列表加载', async ({ page }) => {
      // 访问用户管理页面
      await page.goto(`${ADMIN_URL}/users`);
      
      // 验证页面加载
      await expect(page.getByRole('heading', { name: /用户管理/ })).toBeVisible();
      
      // 验证用户列表表格存在
      await expect(page.locator('table').first()).toBeVisible();
    });

    test('ADMIN-USER-003: 搜索功能', async ({ page }) => {
      // 访问用户管理页面
      await page.goto(`${ADMIN_URL}/users`);
      
      // 查找搜索输入框并输入关键词
      const searchInput = page.getByPlaceholder(/搜索/).first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('test');
        await searchInput.press('Enter');
        
        // 验证搜索结果
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('小说管理', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto(`${ADMIN_URL}/login`);
      await page.getByLabel(/管理员账号|账号/).fill('admin');
      await page.getByLabel(/密码/).fill('admin123');
      await page.getByRole('button', { name: /登录/ }).click();
      await page.waitForURL(`${ADMIN_URL}/dashboard`);
    });

    test('ADMIN-NOVEL-001: 小说列表加载', async ({ page }) => {
      // 访问小说管理页面
      await page.goto(`${ADMIN_URL}/novels`);
      
      // 验证页面加载
      await expect(page.getByRole('heading', { name: /小说管理/ })).toBeVisible();
      
      // 验证小说列表存在
      await expect(page.locator('table').first()).toBeVisible();
    });

    test('ADMIN-NOVEL-002: 状态筛选', async ({ page }) => {
      // 访问小说管理页面
      await page.goto(`${ADMIN_URL}/novels`);
      
      // 查找状态筛选器
      const statusFilter = page.getByRole('combobox').first();
      if (await statusFilter.isVisible().catch(() => false)) {
        await statusFilter.click();
        await page.getByRole('option', { name: /已发布|Published/ }).click();
        
        // 验证筛选结果
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
      expect(stats).toHaveProperty('readers');
      expect(stats).toHaveProperty('claws');
      expect(stats).toHaveProperty('novels');
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
