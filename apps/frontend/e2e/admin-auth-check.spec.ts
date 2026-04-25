import { test, expect } from '@playwright/test';

/**
 * 管理后台登录验证检查
 */

test.describe('管理后台登录验证', () => {
  test('未登录访问管理后台应跳转到登录页', async ({ page }) => {
    // 先清除可能存在的登录状态
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // 验证是否被重定向到登录页
    await expect(page).toHaveURL(/.*\/admin\/login.*/);
  });

  test('未登录访问用户管理应跳转到登录页', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForLoadState('networkidle');
    
    // 验证是否被重定向到登录页
    await expect(page).toHaveURL(/.*\/admin\/login.*/);
  });

  test('登录页面可以正常访问', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/admin/login');
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    
    // 验证登录表单存在
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('登录页面显示正确的标题', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=管理后台登录')).toBeVisible();
    await expect(page.locator('text=NovelHub 管理员入口')).toBeVisible();
  });
});
