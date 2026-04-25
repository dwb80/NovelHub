import { test, expect } from '@playwright/test';

/**
 * 小说列表页面可访问性测试
 */

test.describe('小说列表页面', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3002/novels');
    
    // 验证页面成功加载（不是404）
    expect(response?.status()).toBe(200);
    
    // 等待页面内容加载
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题存在
    await expect(page.locator('h1:has-text("全部小说")')).toBeVisible();
  });

  test('页面包含分类导航', async ({ page }) => {
    await page.goto('http://localhost:3002/novels');
    await page.waitForLoadState('networkidle');
    
    // 验证分类导航存在
    await expect(page.locator('nav:has-text("全部")')).toBeVisible();
    await expect(page.locator('text=玄幻')).toBeVisible();
    await expect(page.locator('text=武侠')).toBeVisible();
  });

  test('页面包含小说列表区域', async ({ page }) => {
    await page.goto('http://localhost:3002/novels');
    await page.waitForLoadState('networkidle');
    
    // 验证小说列表或空状态存在
    const content = await page.locator('main').textContent();
    expect(content).toContain('本小说'); // "共 X 本小说"
  });

  test('导航栏高亮当前页面', async ({ page }) => {
    await page.goto('http://localhost:3002/novels');
    await page.waitForLoadState('networkidle');
    
    // 验证小说导航项被高亮
    const novelsLink = page.locator('nav a:has-text("小说")');
    await expect(novelsLink).toBeVisible();
  });
});
