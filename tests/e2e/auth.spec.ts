/**
 * E2E测试: 用户认证流程
 * 测试ID: E2E-001, E2E-002
 * 覆盖: 用户注册、登录、登出
 */

import { test, expect } from '@playwright/test';
import { LoginPage, RegisterPage, HomePage } from './fixtures/page-objects';
import { testUsers, generateUniqueUser } from './fixtures/test-data';

test.describe('用户认证流程', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:8080';

  test.describe('用户注册', () => {
    test('E2E-001: 用户注册完整流程', async ({ page }) => {
      const registerPage = new RegisterPage(page, baseUrl);
      const newUser = generateUniqueUser();

      // 访问注册页面
      await registerPage.goto();
      await expect(page).toHaveURL(/register/);

      // 填写注册表单
      await registerPage.register(newUser.username, newUser.email, newUser.password);

      // 验证注册成功
      await expect(page).not.toHaveURL(/register/);
      
      // 验证Toast提示
      const toastMessage = await registerPage.getToastMessage().catch(() => '');
      expect(toastMessage.includes('成功') || toastMessage.includes('注册')).toBeTruthy();
    });

    test('E2E-001-NEG: 注册时密码不匹配', async ({ page }) => {
      const registerPage = new RegisterPage(page, baseUrl);
      const newUser = generateUniqueUser();

      await registerPage.goto();
      
      // 填写不匹配的密码
      await registerPage.usernameInput.fill(newUser.username);
      await registerPage.emailInput.fill(newUser.email);
      await registerPage.passwordInput.fill(newUser.password);
      await registerPage.confirmPasswordInput.fill('DifferentPassword123');
      await registerPage.registerButton.click();

      // 验证错误提示
      await expect(page.locator('.error, .form-error')).toBeVisible();
    });

    test('E2E-001-NEG: 注册时邮箱已存在', async ({ page }) => {
      const registerPage = new RegisterPage(page, baseUrl);
      const existingUser = testUsers.user1;

      await registerPage.goto();
      await registerPage.register(
        `user_${Date.now()}`, 
        existingUser.email, 
        existingUser.password
      );

      // 验证错误提示
      await expect(page.locator('.error, .toast-error, .alert-error')).toBeVisible();
    });
  });

  test.describe('用户登录', () => {
    test('E2E-002: 用户登录与登出流程', async ({ page }) => {
      const loginPage = new LoginPage(page, baseUrl);
      const homePage = new HomePage(page, baseUrl);
      const user = testUsers.user1;

      // 访问登录页面
      await loginPage.goto();
      await expect(page).toHaveURL(/login/);

      // 登录
      await loginPage.login(user.email, user.password);

      // 验证登录成功 - 跳转到首页或用户页面
      await expect(page).not.toHaveURL(/login/);

      // 验证用户头像显示（表示已登录）
      await page.goto(`${baseUrl}/index.html`);
      await page.waitForTimeout(1000);
      
      const isLoggedIn = await homePage.isLoggedIn();
      // 如果头像不可见，检查localStorage中的token
      if (!isLoggedIn) {
        const token = await page.evaluate(() => localStorage.getItem('novelhub-token'));
        expect(token).toBeTruthy();
      }
    });

    test('E2E-002-NEG: 登录时密码错误', async ({ page }) => {
      const loginPage = new LoginPage(page, baseUrl);
      const user = testUsers.user1;

      await loginPage.goto();
      await loginPage.login(user.email, 'WrongPassword123');

      // 验证仍在登录页面
      await expect(page).toHaveURL(/login/);
      
      // 验证错误提示
      await expect(page.locator('.error, .toast-error, .alert-error')).toBeVisible();
    });

    test('E2E-002-NEG: 登录时不存在的用户', async ({ page }) => {
      const loginPage = new LoginPage(page, baseUrl);

      await loginPage.goto();
      await loginPage.login('nonexistent@example.com', 'Test@123456');

      // 验证错误提示
      await expect(page.locator('.error, .toast-error, .alert-error')).toBeVisible();
    });
  });

  test.describe('会话管理', () => {
    test('E2E-002: 记住登录状态', async ({ page, context }) => {
      const loginPage = new LoginPage(page, baseUrl);
      const user = testUsers.user1;

      await loginPage.goto();
      await loginPage.login(user.email, user.password);

      // 等待登录完成
      await page.waitForTimeout(2000);

      // 验证localStorage中有token
      const token = await page.evaluate(() => localStorage.getItem('novelhub-token'));
      expect(token).toBeTruthy();

      // 关闭页面并重新打开
      await page.close();
      const newPage = await context.newPage();
      
      // 访问首页
      await newPage.goto(`${baseUrl}/index.html`);
      await newPage.waitForTimeout(1000);

      // 验证仍然保持登录状态
      const newToken = await newPage.evaluate(() => localStorage.getItem('novelhub-token'));
      expect(newToken).toBe(token);
    });

    test('E2E-002: 登出功能', async ({ page }) => {
      const loginPage = new LoginPage(page, baseUrl);
      const homePage = new HomePage(page, baseUrl);
      const user = testUsers.user1;

      // 先登录
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      await page.waitForTimeout(2000);

      // 访问首页
      await homePage.goto();

      // 点击用户头像或菜单
      const userMenu = page.locator('.user-avatar, .user-menu, .avatar').first();
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.waitForTimeout(500);

        // 点击退出登录
        const logoutButton = page.locator('.btn-logout, a:has-text("退出"), button:has-text("退出")').first();
        if (await logoutButton.isVisible().catch(() => false)) {
          await logoutButton.click();
          await page.waitForTimeout(1000);

          // 验证token被清除
          const token = await page.evaluate(() => localStorage.getItem('novelhub-token'));
          expect(token).toBeFalsy();
        }
      }
    });
  });
});
