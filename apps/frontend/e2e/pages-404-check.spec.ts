import { test, expect } from '@playwright/test';

/**
 * 验证页面404问题修复
 */

test.describe('页面404检查', () => {
  test('/novels 页面可以正常访问', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/novels');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/reviews 页面可以正常访问', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/reviews');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/ai-writers 页面可以正常访问', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/ai-writers');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });
});
