import { test, expect } from '@playwright/test';

/**
 * 验证修复的测试用例
 * 1. HOME-025: Footer关于我们链接跳转
 * 2. AUTH-024: 密码重置页面
 * 3. AUTH-028: 重置密码页面
 */

test.describe('验证修复 - Footer链接', () => {
  
  test('HOME-025: Footer关于我们链接正确跳转', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // 找到关于我们链接并验证href属性
    const aboutLink = page.locator('footer a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    
    // 验证链接href属性
    const href = await aboutLink.getAttribute('href');
    expect(href).toBe('/about');
    
    // 点击链接并等待导航
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      aboutLink.click()
    ]);
    
    // 验证URL
    expect(page.url()).toContain('/about');
    
    // 验证页面内容 - 使用更精确的选择器
    await expect(page.getByRole('heading', { name: '关于 NovelHub' })).toBeVisible();
    
    console.log('✅ HOME-025: Footer关于我们链接正确跳转 - 修复验证通过');
  });
});

test.describe('验证修复 - 密码重置页面', () => {
  
  test('AUTH-024: 密码重置页面正常加载并有表单', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '重置密码' })).toBeVisible();
    
    // 验证邮箱输入框
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', /邮箱/);
    
    // 验证发送按钮
    const submitButton = page.getByRole('button', { name: '发送重置链接' });
    await expect(submitButton).toBeVisible();
    
    // 验证返回登录链接
    const loginLink = page.getByRole('link', { name: '返回登录' });
    await expect(loginLink).toBeVisible();
    
    console.log('✅ AUTH-024: 密码重置页面正常加载并有表单 - 修复验证通过');
  });

  test('AUTH-025: 密码重置表单可交互', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // 输入邮箱
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('test@example.com');
    
    // 验证输入值
    await expect(emailInput).toHaveValue('test@example.com');
    
    console.log('✅ AUTH-025: 密码重置表单可交互 - 修复验证通过');
  });
});

test.describe('验证修复 - 重置密码页面', () => {
  
  test('AUTH-028: 重置密码页面正常加载并有密码输入', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '设置新密码' })).toBeVisible();
    
    // 验证新密码输入框
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // 验证确认密码输入框
    const confirmInput = page.locator('input#confirmPassword');
    await expect(confirmInput).toBeVisible();
    await expect(confirmInput).toHaveAttribute('type', 'password');
    
    // 验证重置按钮
    const resetButton = page.getByRole('button', { name: '重置密码' });
    await expect(resetButton).toBeVisible();
    
    console.log('✅ AUTH-028: 重置密码页面正常加载并有密码输入 - 修复验证通过');
  });

  test('AUTH-029: 重置密码表单可填写并验证', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token');
    await page.waitForLoadState('networkidle');
    
    // 填写新密码
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('newpassword123');
    await expect(passwordInput).toHaveValue('newpassword123');
    
    // 填写确认密码
    const confirmInput = page.locator('input#confirmPassword');
    await confirmInput.fill('newpassword123');
    await expect(confirmInput).toHaveValue('newpassword123');
    
    console.log('✅ AUTH-029: 重置密码表单可填写并验证 - 修复验证通过');
  });

  test('AUTH-030: 密码不一致时显示错误', async ({ page }) => {
    await page.goto('/reset-password?token=mock-reset-token');
    await page.waitForLoadState('networkidle');
    
    // 填写不同的密码
    await page.locator('input#password').fill('password123');
    await page.locator('input#confirmPassword').fill('different456');
    
    // 提交表单
    await page.getByRole('button', { name: '重置密码' }).click();
    
    // 等待错误提示
    await page.waitForTimeout(500);
    
    // 验证错误消息
    const errorMessage = page.locator('text=/不一致|不匹配/');
    await expect(errorMessage).toBeVisible();
    
    console.log('✅ AUTH-030: 密码不一致时显示错误 - 修复验证通过');
  });

  test('AUTH-031: 无效token时显示错误', async ({ page }) => {
    // 不带token访问
    await page.goto('/reset-password');
    await page.waitForLoadState('networkidle');
    
    // 验证错误提示
    const errorMessage = page.locator('text=/无效|过期/');
    await expect(errorMessage).toBeVisible();
    
    // 验证提交按钮被禁用
    const resetButton = page.getByRole('button', { name: '重置密码' });
    await expect(resetButton).toBeDisabled();
    
    console.log('✅ AUTH-031: 无效token时显示错误 - 修复验证通过');
  });
});
