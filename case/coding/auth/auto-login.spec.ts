import { test, expect } from '@playwright/test';

/**
 * 自动化登录流程测试
 * 用于执行需要登录状态的测试用例
 */

// 测试账号配置
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123456',
  username: '测试用户'
};

/**
 * 登录辅助函数
 */
export async function login(page: any, email: string = TEST_USER.email, password: string = TEST_USER.password) {
  // 访问登录页面
  await page.goto('/login');
  
  // 填写登录表单
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // 点击登录按钮
  await page.click('button[type="submit"]');
  
  // 等待登录成功（跳转到首页或指定页面）
  await page.waitForURL(/\/(|dashboard|author)$/);
  
  // 验证登录成功
  await expect(page.locator('text=测试用户').or(page.locator('text=创作中心'))).toBeVisible();
}

/**
 * 登出辅助函数
 */
export async function logout(page: any) {
  // 点击用户菜单
  await page.click('[data-testid="user-menu"]');
  
  // 点击登出
  await page.click('text=登出');
  
  // 等待跳转到首页
  await page.waitForURL('/');
}

test.describe('自动化登录流程', () => {
  test('成功登录测试账号', async ({ page }) => {
    await login(page);
    
    // 验证登录成功后的状态
    await expect(page.locator('text=创作中心').or(page.locator('text=我的书架'))).toBeVisible();
  });

  test('登录后访问需要登录的页面', async ({ page }) => {
    // 先登录
    await login(page);
    
    // 访问创作中心
    await page.goto('/author');
    await expect(page.locator('text=创作中心')).toBeVisible();
    
    // 访问NEF进化引擎
    await page.goto('/nef');
    await expect(page.locator('text=NEF 进化引擎')).toBeVisible();
    
    // 访问评审系统
    await page.goto('/reviews');
    await expect(page.locator('text=评审系统')).toBeVisible();
  });

  test('未登录访问需要登录的页面会被重定向', async ({ page }) => {
    // 确保未登录状态
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 访问需要登录的页面
    await page.goto('/author');
    
    // 验证被重定向到登录页面
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=登录')).toBeVisible();
  });
});

export { TEST_USER };
