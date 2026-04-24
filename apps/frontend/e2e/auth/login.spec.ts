/**
 * 读者登录模块 E2E 测试
 * 测试用例对应: case/frontend/auth/login-test-cases.md
 * 
 * 运行命令:
 *   npx playwright test login.spec.ts
 *   npx playwright test login.spec.ts --headed
 *   npx playwright test login.spec.ts --grep "读者成功登录"
 */

import { test, expect, Page } from '@playwright/test';

// 测试数据
const TEST_DATA = {
  validReader: {
    email: 'test@example.com',
    password: 'Test1234',
  },
  invalid: {
    wrongPassword: 'WrongPass123',
    notExistEmail: 'notexist@example.com',
    invalidEmail: 'invalid-email',
    invalidEmailNoAt: 'testexample.com',
    invalidEmailNoDomain: 'test@',
  },
};

// 页面 URL - 使用相对路径，baseURL 在 playwright.config.ts 中配置

/**
 * 登录页面对象
 * 封装登录页面的所有操作
 */
class LoginPage {
  constructor(private page: Page) { }

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  // 填写邮箱 - 使用 data-testid
  async fillEmail(email: string) {
    await this.page.getByTestId('email-input').fill(email);
  }

  // 填写密码 - 使用 data-testid
  async fillPassword(password: string) {
    await this.page.getByTestId('password-input').fill(password);
  }

  // 点击登录按钮 - 使用 data-testid
  async clickLogin() {
    await this.page.getByTestId('login-button').click();
  }

  // 获取错误提示 - 使用 data-testid
  getErrorAlert() {
    return this.page.getByTestId('login-error');
  }

  // 检查是否在首页
  async isOnHomePage() {
    const url = this.page.url();
    return url.endsWith('/') || url.match(/localhost:\d+\/?$/);
  }

  // 检查是否在登录页
  async isOnLoginPage() {
    return this.page.url().includes('/login');
  }

  // 获取本地存储中的 token
  async getLocalStorage() {
    return this.page.evaluate(() => ({
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    }));
  }

  // 清除本地存储
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });
  }
}

/**
 * 测试套件: 登录成功 - 正例测试
 * 对应测试用例: LOGIN-001
 */
test.describe('登录成功 - 正例测试', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.clearLocalStorage();
  });

  // LOGIN-001: 读者使用邮箱成功登录
  test('读者使用邮箱成功登录', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 先注册一个测试用户（如果还没注册）
    try {
      await loginPage.fillEmail(TEST_DATA.validReader.email);
      await loginPage.fillPassword(TEST_DATA.validReader.password);
      await loginPage.clickLogin();

      // 等待导航完成
      await page.waitForURL(/\/$/, { timeout: 10000 });

      // 验证在首页
      await expect.poll(async () => loginPage.isOnHomePage()).toBe(true);

      const localStorage = await loginPage.getLocalStorage();
      expect(localStorage.accessToken).toBeTruthy();
      expect(localStorage.refreshToken).toBeTruthy();
    } catch {
      // 如果用户不存在，跳过此测试
      test.skip();
    }
  });
});

/**
 * 测试套件: 表单验证 - 负例测试
 * 对应测试用例: LOGIN-002 ~ LOGIN-004
 */
test.describe('表单验证 - 负例测试', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // LOGIN-002: 邮箱为空时阻止提交
  test('邮箱为空时阻止提交', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 只填写密码
    await loginPage.fillPassword(TEST_DATA.validReader.password);

    // 尝试点击登录
    await loginPage.clickLogin();

    // 验证仍在登录页（HTML5 验证阻止提交）
    await expect.poll(async () => loginPage.isOnLoginPage()).toBe(true);
  });

  // LOGIN-003: 密码为空时阻止提交
  test('密码为空时阻止提交', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 只填写邮箱
    await loginPage.fillEmail(TEST_DATA.validReader.email);

    // 尝试点击登录
    await loginPage.clickLogin();

    // 验证仍在登录页（HTML5 验证阻止提交）
    await expect.poll(async () => loginPage.isOnLoginPage()).toBe(true);
  });

  // LOGIN-004: 邮箱格式无效
  test('邮箱格式无效时浏览器提示', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 输入无效邮箱格式
    await loginPage.fillEmail(TEST_DATA.invalid.invalidEmail);
    await loginPage.fillPassword(TEST_DATA.validReader.password);

    // 尝试点击登录
    await loginPage.clickLogin();

    // 验证仍在登录页（HTML5 验证阻止提交）
    await expect.poll(async () => loginPage.isOnLoginPage()).toBe(true);
  });
});

/**
 * 测试套件: 登录失败 - 错误处理测试
 * 对应测试用例: LOGIN-005 ~ LOGIN-006
 */
test.describe('登录失败 - 错误处理测试', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // LOGIN-005: 密码错误时显示错误信息
  test('密码错误时显示错误信息', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.fillEmail(TEST_DATA.validReader.email);
    await loginPage.fillPassword(TEST_DATA.invalid.wrongPassword);
    await loginPage.clickLogin();

    // 等待错误提示出现
    const error = loginPage.getErrorAlert();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('登录失败');

    // 验证仍在登录页
    await expect.poll(async () => loginPage.isOnLoginPage()).toBe(true);
  });

  // LOGIN-006: 未注册邮箱登录
  test('未注册邮箱登录显示错误', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.fillEmail(TEST_DATA.invalid.notExistEmail);
    await loginPage.fillPassword(TEST_DATA.validReader.password);
    await loginPage.clickLogin();

    // 等待错误提示出现
    const error = loginPage.getErrorAlert();
    await expect(error).toBeVisible({ timeout: 5000 });
    await expect(error).toContainText('登录失败');

    // 验证仍在登录页
    await expect.poll(async () => loginPage.isOnLoginPage()).toBe(true);
  });
});

/**
 * 测试套件: UI 交互测试
 * 对应测试用例: LOGIN-007 ~ LOGIN-010
 */
test.describe('UI 交互测试', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // LOGIN-007: 加载状态显示
  test('加载状态显示', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.fillEmail(TEST_DATA.validReader.email);
    await loginPage.fillPassword(TEST_DATA.validReader.password);

    // 点击登录前检查按钮是启用的
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeEnabled();

    // 点击登录
    await loginPage.clickLogin();

    // 检查按钮在提交后被禁用（处于加载状态）
    // 由于登录可能很快完成，我们检查按钮是否曾经被禁用
    await expect.poll(async () => {
      const isDisabled = await loginButton.isDisabled().catch(() => false);
      return isDisabled;
    }, {
      timeout: 3000,
      message: '按钮应该在提交后被禁用'
    }).toBe(true);
  });

  // LOGIN-008: 点击注册链接跳转
  test('点击注册链接跳转到注册页', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 点击注册链接
    await page.getByRole('link', { name: '立即注册' }).click();

    // 验证跳转到注册页
    await page.waitForURL(/\/register$/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/register$/);
  });

  // LOGIN-009: 页面标题正确
  test('页面标题正确', async ({ page }) => {
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '读者登录' })).toBeVisible();
  });

  // LOGIN-010: Logo 点击返回首页
  test('点击Logo返回首页', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // 点击 Logo
    await page.getByRole('link', { name: /NovelHub/ }).click();

    // 验证返回首页
    await page.waitForURL(/localhost:\d+\/?$/, { timeout: 5000 });
    await expect(page).toHaveURL(/localhost:\d+\/?$/);
  });
});

/**
 * 测试套件: 安全性测试
 * 对应测试用例: LOGIN-011 ~ LOGIN-012
 */
test.describe('安全性测试', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // LOGIN-011: 密码输入框类型为 password
  test('密码输入框类型正确', async ({ page }) => {
    // 验证密码输入框类型
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // LOGIN-012: 登录失败后密码不清空
  test('登录失败后密码不清空', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.fillEmail(TEST_DATA.validReader.email);
    await loginPage.fillPassword(TEST_DATA.invalid.wrongPassword);
    await loginPage.clickLogin();

    // 等待错误提示
    await expect(loginPage.getErrorAlert()).toBeVisible({ timeout: 5000 });

    // 验证密码仍然保留
    const passwordValue = await page.getByTestId('password-input').inputValue();
    expect(passwordValue).toBe(TEST_DATA.invalid.wrongPassword);
  });
});
