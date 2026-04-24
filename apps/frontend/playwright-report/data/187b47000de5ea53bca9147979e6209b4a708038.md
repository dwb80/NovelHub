# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-fixes.spec.ts >> 验证修复 - 重置密码页面 >> AUTH-028: 重置密码页面正常加载并有密码输入
- Location: e2e\verify-fixes.spec.ts:86:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]: missing required error components, refreshing...
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * 验证修复的测试用例
  5   |  * 1. HOME-025: Footer关于我们链接跳转
  6   |  * 2. AUTH-024: 密码重置页面
  7   |  * 3. AUTH-028: 重置密码页面
  8   |  */
  9   | 
  10  | test.describe('验证修复 - Footer链接', () => {
  11  |   
  12  |   test('HOME-025: Footer关于我们链接正确跳转', async ({ page }) => {
  13  |     await page.goto('/');
  14  |     await page.waitForLoadState('networkidle');
  15  |     
  16  |     // 滚动到页面底部
  17  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  18  |     await page.waitForTimeout(500);
  19  |     
  20  |     // 找到关于我们链接并验证href属性
  21  |     const aboutLink = page.locator('footer a[href="/about"]');
  22  |     await expect(aboutLink).toBeVisible();
  23  |     
  24  |     // 验证链接href属性
  25  |     const href = await aboutLink.getAttribute('href');
  26  |     expect(href).toBe('/about');
  27  |     
  28  |     // 点击链接并等待导航
  29  |     await Promise.all([
  30  |       page.waitForNavigation({ waitUntil: 'networkidle' }),
  31  |       aboutLink.click()
  32  |     ]);
  33  |     
  34  |     // 验证URL
  35  |     expect(page.url()).toContain('/about');
  36  |     
  37  |     // 验证页面内容 - 使用更精确的选择器
  38  |     await expect(page.getByRole('heading', { name: '关于 NovelHub' })).toBeVisible();
  39  |     
  40  |     console.log('✅ HOME-025: Footer关于我们链接正确跳转 - 修复验证通过');
  41  |   });
  42  | });
  43  | 
  44  | test.describe('验证修复 - 密码重置页面', () => {
  45  |   
  46  |   test('AUTH-024: 密码重置页面正常加载并有表单', async ({ page }) => {
  47  |     await page.goto('/forgot-password');
  48  |     await page.waitForLoadState('networkidle');
  49  |     
  50  |     // 验证页面标题
  51  |     await expect(page.getByRole('heading', { name: '重置密码' })).toBeVisible();
  52  |     
  53  |     // 验证邮箱输入框
  54  |     const emailInput = page.locator('input[type="email"]');
  55  |     await expect(emailInput).toBeVisible();
  56  |     await expect(emailInput).toHaveAttribute('placeholder', /邮箱/);
  57  |     
  58  |     // 验证发送按钮
  59  |     const submitButton = page.getByRole('button', { name: '发送重置链接' });
  60  |     await expect(submitButton).toBeVisible();
  61  |     
  62  |     // 验证返回登录链接
  63  |     const loginLink = page.getByRole('link', { name: '返回登录' });
  64  |     await expect(loginLink).toBeVisible();
  65  |     
  66  |     console.log('✅ AUTH-024: 密码重置页面正常加载并有表单 - 修复验证通过');
  67  |   });
  68  | 
  69  |   test('AUTH-025: 密码重置表单可交互', async ({ page }) => {
  70  |     await page.goto('/forgot-password');
  71  |     await page.waitForLoadState('networkidle');
  72  |     
  73  |     // 输入邮箱
  74  |     const emailInput = page.locator('input[type="email"]');
  75  |     await emailInput.fill('test@example.com');
  76  |     
  77  |     // 验证输入值
  78  |     await expect(emailInput).toHaveValue('test@example.com');
  79  |     
  80  |     console.log('✅ AUTH-025: 密码重置表单可交互 - 修复验证通过');
  81  |   });
  82  | });
  83  | 
  84  | test.describe('验证修复 - 重置密码页面', () => {
  85  |   
  86  |   test('AUTH-028: 重置密码页面正常加载并有密码输入', async ({ page }) => {
  87  |     await page.goto('/reset-password?token=mock-reset-token');
> 88  |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  89  |     
  90  |     // 验证页面标题
  91  |     await expect(page.getByRole('heading', { name: '设置新密码' })).toBeVisible();
  92  |     
  93  |     // 验证新密码输入框
  94  |     const passwordInput = page.locator('input#password');
  95  |     await expect(passwordInput).toBeVisible();
  96  |     await expect(passwordInput).toHaveAttribute('type', 'password');
  97  |     
  98  |     // 验证确认密码输入框
  99  |     const confirmInput = page.locator('input#confirmPassword');
  100 |     await expect(confirmInput).toBeVisible();
  101 |     await expect(confirmInput).toHaveAttribute('type', 'password');
  102 |     
  103 |     // 验证重置按钮
  104 |     const resetButton = page.getByRole('button', { name: '重置密码' });
  105 |     await expect(resetButton).toBeVisible();
  106 |     
  107 |     console.log('✅ AUTH-028: 重置密码页面正常加载并有密码输入 - 修复验证通过');
  108 |   });
  109 | 
  110 |   test('AUTH-029: 重置密码表单可填写并验证', async ({ page }) => {
  111 |     await page.goto('/reset-password?token=mock-reset-token');
  112 |     await page.waitForLoadState('networkidle');
  113 |     
  114 |     // 填写新密码
  115 |     const passwordInput = page.locator('input#password');
  116 |     await passwordInput.fill('newpassword123');
  117 |     await expect(passwordInput).toHaveValue('newpassword123');
  118 |     
  119 |     // 填写确认密码
  120 |     const confirmInput = page.locator('input#confirmPassword');
  121 |     await confirmInput.fill('newpassword123');
  122 |     await expect(confirmInput).toHaveValue('newpassword123');
  123 |     
  124 |     console.log('✅ AUTH-029: 重置密码表单可填写并验证 - 修复验证通过');
  125 |   });
  126 | 
  127 |   test('AUTH-030: 密码不一致时显示错误', async ({ page }) => {
  128 |     await page.goto('/reset-password?token=mock-reset-token');
  129 |     await page.waitForLoadState('networkidle');
  130 |     
  131 |     // 填写不同的密码
  132 |     await page.locator('input#password').fill('password123');
  133 |     await page.locator('input#confirmPassword').fill('different456');
  134 |     
  135 |     // 提交表单
  136 |     await page.getByRole('button', { name: '重置密码' }).click();
  137 |     
  138 |     // 等待错误提示
  139 |     await page.waitForTimeout(500);
  140 |     
  141 |     // 验证错误消息
  142 |     const errorMessage = page.locator('text=/不一致|不匹配/');
  143 |     await expect(errorMessage).toBeVisible();
  144 |     
  145 |     console.log('✅ AUTH-030: 密码不一致时显示错误 - 修复验证通过');
  146 |   });
  147 | 
  148 |   test('AUTH-031: 无效token时显示错误', async ({ page }) => {
  149 |     // 不带token访问
  150 |     await page.goto('/reset-password');
  151 |     await page.waitForLoadState('networkidle');
  152 |     
  153 |     // 验证错误提示
  154 |     const errorMessage = page.locator('text=/无效|过期/');
  155 |     await expect(errorMessage).toBeVisible();
  156 |     
  157 |     // 验证提交按钮被禁用
  158 |     const resetButton = page.getByRole('button', { name: '重置密码' });
  159 |     await expect(resetButton).toBeDisabled();
  160 |     
  161 |     console.log('✅ AUTH-031: 无效token时显示错误 - 修复验证通过');
  162 |   });
  163 | });
  164 | 
```