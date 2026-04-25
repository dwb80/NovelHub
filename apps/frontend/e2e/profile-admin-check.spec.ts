import { test, expect } from '@playwright/test';

/**
 * Profile 和 Admin Login 页面检查
 */

test.describe('Profile 页面', () => {
  test('页面可以正常访问', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/profile');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
  });

  test('页面包含个人信息元素', async ({ page }) => {
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题或主要内容存在
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toContain('个人中心');
  });
});

test.describe('Admin Login 页面', () => {
  test('页面可以正常访问且不返回404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/admin/login');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
  });

  test('页面包含登录表单元素', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    // 验证登录表单元素
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('页面显示管理后台标题', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=管理后台登录')).toBeVisible();
    await expect(page.locator('text=NovelHub 管理员入口')).toBeVisible();
  });
});
