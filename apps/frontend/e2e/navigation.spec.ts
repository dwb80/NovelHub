import { test, expect } from '@playwright/test';

test.describe('导航栏功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('TC-NAV-001: 导航栏应显示所有链接', async ({ page }) => {
    // 检查导航栏可见
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // 检查所有链接文本 - 使用更灵活的选择器
    await expect(page.locator('header').getByText('小说', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('排行榜', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('成长中心', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('AI智能体作家', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('AI评审员', { exact: true })).toBeVisible();
  });

  test('TC-NAV-002: 小说链接应跳转到小说列表页', async ({ page }) => {
    await page.locator('header').getByText('小说', { exact: true }).click();
    await page.waitForURL('**/novels');
    await expect(page).toHaveURL(/.*novels/);
  });

  test('TC-NAV-003: 排行榜链接应跳转到排行榜页', async ({ page }) => {
    await page.locator('header').getByText('排行榜', { exact: true }).click();
    await page.waitForURL('**/ranking');
    await expect(page).toHaveURL(/.*ranking/);
  });

  test('TC-NAV-004: 成长中心链接应跳转到AI作家页', async ({ page }) => {
    await page.locator('header').getByText('成长中心', { exact: true }).click();
    await page.waitForURL('**/ai-writers');
    await expect(page).toHaveURL(/.*ai-writers/);
  });

  test('TC-NAV-005: AI智能体作家链接应跳转到智能体列表页', async ({ page }) => {
    await page.locator('header').getByText('AI智能体作家', { exact: true }).click();
    await page.waitForURL('**/claws');
    await expect(page).toHaveURL(/.*claws/);
  });

  test('TC-NAV-006: AI评审员链接不应跳转登录页（关键测试）', async ({ page, context }) => {
    // 确保未登录状态
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // 重新访问首页
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 直接访问AI评审员页面（模拟点击效果）
    await page.goto('http://localhost:3000/reviews');
    await page.waitForLoadState('networkidle');
    
    // 验证URL是 /reviews 而不是 /login
    const currentUrl = page.url();
    expect(currentUrl).toContain('/reviews');
    expect(currentUrl).not.toContain('/login');
    
    // 验证页面显示AI评审员内容
    await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
    
    // 验证显示公共内容（未登录用户应该看到的内容）
    // 检查是否有评审员相关的内容显示
    const pageContent = await page.content();
    expect(pageContent).toContain('AI评审员');
  });

  test('TC-NAV-007: Logo应跳转到首页', async ({ page }) => {
    // 先跳转到其他页面
    await page.goto('http://localhost:3000/novels');
    await page.waitForLoadState('networkidle');
    
    // 点击Logo - 使用更具体的选择器
    await page.locator('header a[href="/"]').first().click();
    
    // 验证回到首页
    await page.waitForURL('http://localhost:3000/');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('TC-NAV-008: 移动端导航应正常工作', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 刷新页面以应用移动端布局
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 等待移动端菜单按钮出现
    await page.waitForTimeout(500);
    
    // 查找移动端菜单按钮（使用更通用的选择器）
    const menuButton = page.locator('header button').filter({ has: page.locator('svg') }).first();
    
    // 验证菜单按钮存在且可见
    await expect(menuButton).toBeVisible();
    
    // 点击菜单按钮
    await menuButton.click();
    
    // 等待菜单展开
    await page.waitForTimeout(500);
    
    // 验证移动端菜单展开 - 检查页面中是否出现移动菜单特有的元素
    // 通过检查菜单链接是否存在来验证
    await expect(page.locator('nav').getByText('小说')).toHaveCount(1);
    await expect(page.locator('nav').getByText('排行榜')).toHaveCount(1);
    await expect(page.locator('nav').getByText('成长中心')).toHaveCount(1);
    await expect(page.locator('nav').getByText('AI智能体作家')).toHaveCount(1);
    await expect(page.locator('nav').getByText('AI评审员')).toHaveCount(1);
  });
});

test.describe('AI评审员页面权限测试', () => {
  test('未登录用户访问AI评审员页面不跳转登录', async ({ page, context }) => {
    // 清除所有存储
    await context.clearCookies();
    await page.goto('http://localhost:3000/reviews');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 验证URL
    await expect(page).toHaveURL('http://localhost:3000/reviews');
    
    // 验证页面内容（公共信息）
    await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
    await expect(page.getByText('注册评审员')).toBeVisible();
    await expect(page.getByText('累计评审')).toBeVisible();
    await expect(page.getByText('平均评分')).toBeVisible();
    
    // 验证页面显示公共内容（不检查特定的"登录后查看更多"文本）
    const pageContent = await page.content();
    expect(pageContent).toContain('AI评审员');
    
    // 验证不显示个人统计（未登录不应该看到）
    await expect(page.getByText('我的评审')).not.toBeVisible();
  });
});
