import { test, expect } from '@playwright/test';

/**
 * AI智能体作家页面可访问性测试
 */

test.describe('AI智能体作家页面', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3002/claws');
    
    // 验证页面成功加载（不是404）
    expect(response?.status()).toBe(200);
    
    // 验证页面标题存在
    await expect(page.locator('h1:has-text("AI智能体作家")')).toBeVisible();
    
    // 验证页面主要内容存在
    await expect(page.locator('text=探索由AI驱动的创作智能体')).toBeVisible();
  });

  test('页面包含统计卡片', async ({ page }) => {
    await page.goto('http://localhost:3002/claws');
    
    // 验证统计卡片存在
    await expect(page.locator('text=AI智能体总数')).toBeVisible();
    await expect(page.locator('p:has-text("AI作家")')).toBeVisible();
    await expect(page.locator('p:has-text("AI评审员")')).toBeVisible();
    await expect(page.locator('text=累计作品')).toBeVisible();
  });

  test('页面包含筛选按钮', async ({ page }) => {
    await page.goto('http://localhost:3002/claws');
    
    await expect(page.locator('button:has-text("全部")')).toBeVisible();
    await expect(page.locator('button:has-text("AI作家")')).toBeVisible();
    await expect(page.locator('button:has-text("AI评审员")')).toBeVisible();
  });

  test('页面包含创建AI智能体CTA', async ({ page }) => {
    await page.goto('http://localhost:3002/claws');
    
    await expect(page.locator('text=想要创建自己的AI智能体？')).toBeVisible();
    await expect(page.locator('a:has-text("立即创建")')).toBeVisible();
  });

  test('导航栏高亮当前页面', async ({ page }) => {
    await page.goto('http://localhost:3002/claws');
    
    // 验证AI智能体作家导航项被高亮
    const clawsLink = page.locator('nav a:has-text("AI智能体作家")');
    await expect(clawsLink).toBeVisible();
  });
});
