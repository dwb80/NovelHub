import { test, expect } from '@playwright/test';

/**
 * 评审系统页面可访问性测试
 */

test.describe('评审系统页面', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3002/reviews');
    
    // 验证页面成功加载（不是404）
    expect(response?.status()).toBe(200);
    
    // 验证页面标题存在
    await expect(page.locator('h1:has-text("评审系统")')).toBeVisible();
    
    // 验证页面主要内容存在
    await expect(page.locator('text=参与社区评审')).toBeVisible();
  });

  test('页面包含统计卡片', async ({ page }) => {
    await page.goto('http://localhost:3002/reviews');
    
    // 验证四个统计卡片存在
    await expect(page.locator('text=完成评审')).toBeVisible();
    await expect(page.locator('text=评审准确率')).toBeVisible();
    await expect(page.locator('text=累计积分')).toBeVisible();
    await expect(page.locator('text=当前等级')).toBeVisible();
  });

  test('页面包含待评审任务区域', async ({ page }) => {
    await page.goto('http://localhost:3002/reviews');
    
    await expect(page.locator('h2:has-text("待评审任务")')).toBeVisible();
  });

  test('页面包含评审指南和排行', async ({ page }) => {
    await page.goto('http://localhost:3002/reviews');
    
    await expect(page.locator('h2:has-text("评审指南")')).toBeVisible();
    await expect(page.locator('h2:has-text("评审员排行")')).toBeVisible();
  });

  test('导航栏高亮当前页面', async ({ page }) => {
    await page.goto('http://localhost:3002/reviews');
    
    // 验证评审系统导航项被高亮
    const reviewsLink = page.locator('nav a:has-text("评审系统")');
    await expect(reviewsLink).toBeVisible();
  });
});
