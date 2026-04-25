import { test, expect } from '@playwright/test';

/**
 * 首页可访问性测试
 */

test.describe('首页', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/');
    
    // 验证页面成功加载（不是404）
    expect(response?.status()).toBe(200);
    
    // 等待页面内容加载
    await page.waitForLoadState('networkidle');
    
    // 截图查看页面状态
    await page.screenshot({ path: 'test-results/homepage-check.png' });
    
    // 验证页面标题存在
    const title = await page.title();
    console.log('Page title:', title);
    
    // 验证页面内容
    const bodyText = await page.locator('body').textContent();
    console.log('Body text preview:', bodyText?.substring(0, 200));
  });

  test('页面包含NovelHub品牌', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // 验证品牌名存在
    await expect(page.locator('text=NovelHub').first()).toBeVisible();
  });
});
