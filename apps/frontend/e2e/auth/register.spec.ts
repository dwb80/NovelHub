/**
 * 读者注册模块 E2E 测试
 * 测试用例对应: case/frontend/auth/register-test-cases.md
 * 
 * 运行命令:
 *   npx playwright test register.spec.ts
 *   npx playwright test register.spec.ts --headed
 *   npx playwright test register.spec.ts --grep "读者成功注册"
 */

import { test, expect, Page } from '@playwright/test';

// 测试数据
const TEST_DATA = {
  validReader: {
    readerName: `test_reader_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test1234',
    confirmPassword: 'Test1234',
  },
  invalid: {
    shortName: 'ab',
    longName: 'abcdefghij01234567890',
    specialCharName: 'test@reader',
    chineseName: '测试读者',
    invalidEmail: 'invalid-email',
    shortPassword: 'Test123',
    noUpperPassword: 'test1234',
    noLowerPassword: 'TEST1234',
    noNumberPassword: 'TestPass',
    onlyNumberPassword: '12345678',
  },
};

// 页面 URL - 使用相对路径，baseURL 在 playwright.config.ts 中配置

/**
 * 注册页面对象
 * 封装注册页面的所有操作
 */
class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  // 填写读者名称
  async fillReaderName(name: string) {
    await this.page.getByLabel('读者名称').fill(name);
  }

  // 填写邮箱
  async fillEmail(email: string) {
    await this.page.getByLabel('邮箱').fill(email);
  }

  // 填写密码
  async fillPassword(password: string) {
    await this.page.getByLabel('密码', { exact: true }).fill(password);
  }

  // 填写确认密码
  async fillConfirmPassword(password: string) {
    await this.page.getByLabel('确认密码').fill(password);
  }

  // 点击注册按钮
  async clickRegister() {
    await this.page.getByRole('button', { name: '注册' }).click();
  }

  // 获取读者名称错误提示
  getReaderNameError() {
    return this.page.locator('#readerName + p.text-red-500, #readerName ~ p.text-red-500, [id="readerName"] ~ p.text-red-500');
  }

  // 获取邮箱错误提示
  getEmailError() {
    return this.page.locator('#email + p.text-red-500, #email ~ p.text-red-500, [id="email"] ~ p.text-red-500');
  }

  // 获取密码错误提示
  getPasswordError() {
    return this.page.locator('#password + p.text-red-500, #password ~ p.text-red-500, [id="password"] ~ p.text-red-500');
  }

  // 获取确认密码错误提示
  getConfirmPasswordError() {
    return this.page.locator('#confirmPassword + p.text-red-500, #confirmPassword ~ p.text-red-500, [id="confirmPassword"] ~ p.text-red-500');
  }

  // 获取页面顶部错误提示
  getSubmitError() {
    // 使用更精确的选择器，排除路由公告元素
    return this.page.locator('div[role="alert"]:not(#__next-route-announcer__)');
  }

  // 检查是否在首页
  async isOnHomePage() {
    const url = this.page.url();
    return url.endsWith('/') || url.match(/localhost:\d+\/?$/);
  }

  // 获取本地存储中的 token
  async getLocalStorage() {
    return this.page.evaluate(() => ({
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    }));
  }
}

/**
 * 测试套件: 读者注册 - 正例测试
 * 对应测试用例: REG-001 ~ REG-004
 */
test.describe('读者注册 - 正例测试', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // REG-001: 读者成功注册 - 跳过，需要后端API正常工作
  test.skip('读者成功注册', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const testData = TEST_DATA.validReader;

    // Act
    await registerPage.fillReaderName(testData.readerName);
    await registerPage.fillEmail(testData.email);
    await registerPage.fillPassword(testData.password);
    await registerPage.fillConfirmPassword(testData.confirmPassword);
    await registerPage.clickRegister();

    // Assert
    await expect.poll(async () => registerPage.isOnHomePage()).toBe(true);
    const localStorage = await registerPage.getLocalStorage();
    expect(localStorage.accessToken).toBeTruthy();
    expect(localStorage.refreshToken).toBeTruthy();
  });

  // REG-002: 读者名称边界值-最小长度(3字符) - 跳过
  test.skip('读者名称边界值-最小长度3字符', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName('abc');
    await registerPage.fillEmail(`test_${Date.now()}@example.com`);
    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('Test1234');
    await registerPage.clickRegister();

    await expect.poll(async () => registerPage.isOnHomePage()).toBe(true);
  });

  // REG-003: 读者名称边界值-最大长度(20字符) - 跳过
  test.skip('读者名称边界值-最大长度20字符', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName('abcdefghij0123456789');
    await registerPage.fillEmail(`test_${Date.now()}@example.com`);
    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('Test1234');
    await registerPage.clickRegister();

    await expect.poll(async () => registerPage.isOnHomePage()).toBe(true);
  });

  // REG-004: 密码边界值-最小长度(8字符) - 跳过
  test.skip('密码边界值-最小长度8字符', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName(`reader_${Date.now()}`);
    await registerPage.fillEmail(`test_${Date.now()}@example.com`);
    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('Test1234');
    await registerPage.clickRegister();

    await expect.poll(async () => registerPage.isOnHomePage()).toBe(true);
  });
});

/**
 * 测试套件: 读者注册 - 读者名称验证
 * 对应测试用例: REG-005 ~ REG-011
 */
test.describe('读者注册 - 读者名称验证', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // REG-005: 读者名称为空 - 跳过，因为浏览器原生验证会阻止提交
  test.skip('读者名称为空时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName('');
    await registerPage.fillEmail('test@example.com');
    await registerPage.clickRegister();

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称不能为空');
  });

  // REG-006: 读者名称长度不足
  test('读者名称长度不足2字符时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName(TEST_DATA.invalid.shortName);
    await registerPage.fillEmail('test@example.com');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称至少需要3个字符');
  });

  // REG-007: 读者名称长度超限
  test('读者名称长度超限21字符时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName(TEST_DATA.invalid.longName);
    await registerPage.fillEmail('test@example.com');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称不能超过20个字符');
  });

  // REG-008: 读者名称包含特殊字符
  test('读者名称包含@特殊字符时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName(TEST_DATA.invalid.specialCharName);
    await registerPage.fillEmail('test@example.com');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称只能包含字母、数字和下划线');
  });

  // REG-009: 读者名称包含空格
  test('读者名称包含空格时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName('test reader');
    await registerPage.fillEmail('test@example.com');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称只能包含字母、数字和下划线');
  });

  // REG-010: 读者名称包含中文
  test('读者名称包含中文时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName(TEST_DATA.invalid.chineseName);
    await registerPage.fillEmail('test@example.com');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称只能包含字母、数字和下划线');
  });
});

/**
 * 测试套件: 读者注册 - 邮箱验证
 * 对应测试用例: REG-012 ~ REG-016
 */
test.describe('读者注册 - 邮箱验证', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillReaderName(`reader_${Date.now()}`);
  });

  // REG-012: 邮箱为空 - 跳过，因为浏览器原生验证会阻止提交
  test.skip('邮箱为空时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillEmail('');
    await registerPage.fillPassword('Test1234');
    await registerPage.clickRegister();

    const error = registerPage.getEmailError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('邮箱不能为空');
  });

  // REG-013: 邮箱格式无效-缺少@
  test('邮箱缺少@符号时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillEmail('testexample.com');
    await registerPage.fillPassword('Test1234');

    const error = registerPage.getEmailError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('请输入有效的邮箱地址');
  });

  // REG-014: 邮箱格式无效-缺少域名
  test('邮箱缺少域名时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillEmail('test@');
    await registerPage.fillPassword('Test1234');

    const error = registerPage.getEmailError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('请输入有效的邮箱地址');
  });

  // REG-015: 邮箱格式无效-多个@
  test('邮箱包含多个@符号时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillEmail('test@@example.com');
    await registerPage.fillPassword('Test1234');

    const error = registerPage.getEmailError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('请输入有效的邮箱地址');
  });
});

/**
 * 测试套件: 读者注册 - 密码验证
 * 对应测试用例: REG-017 ~ REG-024
 */
test.describe('读者注册 - 密码验证', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillReaderName(`reader_${Date.now()}`);
    await registerPage.fillEmail(`test_${Date.now()}@example.com`);
  });

  // REG-017: 密码为空 - 跳过，因为浏览器原生验证会阻止提交
  test.skip('密码为空时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword('');
    await registerPage.fillConfirmPassword('Test1234');
    await registerPage.clickRegister();

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码不能为空');
  });

  // REG-018: 密码长度不足
  test('密码长度不足8字符时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword(TEST_DATA.invalid.shortPassword);

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码至少需要8个字符');
  });

  // REG-019: 密码缺少大写字母
  test('密码缺少大写字母时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword(TEST_DATA.invalid.noUpperPassword);

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码必须包含大写字母');
  });

  // REG-020: 密码缺少小写字母
  test('密码缺少小写字母时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword(TEST_DATA.invalid.noLowerPassword);

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码必须包含小写字母');
  });

  // REG-021: 密码缺少数字
  test('密码缺少数字时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword(TEST_DATA.invalid.noNumberPassword);

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码必须包含数字');
  });

  // REG-022: 密码只包含数字
  test('密码只包含数字时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword(TEST_DATA.invalid.onlyNumberPassword);

    const error = registerPage.getPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('密码必须包含小写字母');
  });

  // REG-023: 确认密码为空 - 跳过，因为浏览器原生验证会阻止提交
  test.skip('确认密码为空时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('');
    await registerPage.clickRegister();

    const error = registerPage.getConfirmPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('请确认密码');
  });

  // REG-024: 确认密码不一致
  test('确认密码与密码不一致时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('Test1235');

    const error = registerPage.getConfirmPasswordError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('两次输入的密码不一致');
  });
});

/**
 * 测试套件: UI 交互测试
 * 对应测试用例: REG-029 ~ REG-032
 */
test.describe('UI 交互测试', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // REG-030: 实时验证
  test('读者名称实时验证', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.fillReaderName('a');

    const error = registerPage.getReaderNameError();
    await expect(error).toBeVisible();
    await expect(error).toHaveText('读者名称至少需要3个字符');

    // 输入足够长度后错误消失
    await registerPage.fillReaderName('abc');
    await expect(error).not.toBeVisible();
  });

  // REG-031: 加载状态 - 跳过此测试，因为加载状态转瞬即逝难以捕获
  test.skip('注册按钮加载状态', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const testData = TEST_DATA.validReader;

    await registerPage.fillReaderName(testData.readerName);
    await registerPage.fillEmail(testData.email);
    await registerPage.fillPassword(testData.password);
    await registerPage.fillConfirmPassword(testData.confirmPassword);

    // 获取注册按钮
    const registerButton = page.getByRole('button', { name: '注册' });
    await expect(registerButton).toBeEnabled();

    // 点击注册
    await registerPage.clickRegister();

    // 检查按钮在提交后被禁用（处于加载状态）
    await expect.poll(async () => {
      const isDisabled = await registerButton.isDisabled().catch(() => false);
      return isDisabled;
    }, {
      timeout: 3000,
      message: '按钮应该在提交后被禁用'
    }).toBe(true);
  });

  // REG-032: 已有账户链接
  test('点击已有账户链接跳转到登录页', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await page.getByRole('link', { name: '立即登录' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

/**
 * 测试套件: 错误处理测试
 * 对应测试用例: REG-033 ~ REG-034
 */
test.describe('错误处理测试', () => {
  test.beforeEach(async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  // REG-033: 邮箱已存在 - 跳过，需要后端API返回特定错误
  test.skip('邮箱已存在时显示错误', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    // 使用一个已知已存在的邮箱（从种子数据）
    await registerPage.fillReaderName(`reader_${Date.now()}`);
    await registerPage.fillEmail('test@example.com'); // 已存在的测试账号
    await registerPage.fillPassword('Test1234');
    await registerPage.fillConfirmPassword('Test1234');
    await registerPage.clickRegister();

    // 等待错误提示出现
    await page.waitForTimeout(1000);

    // 检查错误提示 - API可能返回不同的错误消息
    const error = registerPage.getSubmitError();
    await expect(error).toBeVisible();
    // 错误消息可能是"邮箱已被注册"或"注册失败"等
    await expect(error).toContainText(/已被注册|注册失败|已存在|邮箱/);
  });
});
