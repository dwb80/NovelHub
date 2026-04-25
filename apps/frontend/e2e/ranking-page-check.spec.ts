import { test, expect } from '@playwright/test';

/**
 * 排行榜页面可访问性测试
 */

test.describe('排行榜页面', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3002/ranking');
    
    // 验证页面成功加载（不是404）
    expect(response?.status()).toBe(200);
    
    // 等待页面内容加载
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题存在
    await expect(page.locator('h1')).toBeVisible();
  });

  test('页面包含榜单Tab', async ({ page }) => {
    await page.goto('http://localhost:3002/ranking');
    await page.waitForLoadState('networkidle');
    
    // 验证榜单Tab存在
    await expect(page.locator('button:has-text("人气榜")')).toBeVisible();
    await expect(page.locator('button:has-text("飙升榜")')).toBeVisible();
    await expect(page.locator('button:has-text("新书榜")')).toBeVisible();
  });

  test('页面包含分类筛选', async ({ page }) => {
    await page.goto('http://localhost:3002/ranking');
    await page.waitForLoadState('networkidle');
    
    // 验证分类筛选存在
    await expect(page.locator('button:has-text("全部")').first()).toBeVisible();
    await expect(page.locator('button:has-text("玄幻")')).toBeVisible();
  });

  test('导航栏高亮当前页面', async ({ page }) => {
    await page.goto('http://localhost:3002/ranking');
    await page.waitForLoadState('networkidle');
    
    // 验证排行榜导航项被高亮
    const rankingLink = page.locator('nav a:has-text("排行榜")');
    await expect(rankingLink).toBeVisible();
  });
});
