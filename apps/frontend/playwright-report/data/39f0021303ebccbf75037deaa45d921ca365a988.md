# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-fixes.spec.ts >> 验证修复 - Footer链接 >> HOME-025: Footer关于我们链接正确跳转
- Location: e2e\verify-fixes.spec.ts:12:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('footer a[href="/about"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('footer a[href="/about"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - link "NovelHub" [ref=e5] [cursor=pointer]:
          - /url: /
        - generic [ref=e6]:
          - link "小说" [ref=e7] [cursor=pointer]:
            - /url: /novels
          - link "排行榜" [ref=e8] [cursor=pointer]:
            - /url: /ranking
          - link "书架" [ref=e9] [cursor=pointer]:
            - /url: /bookshelf
          - link "搜索" [ref=e10] [cursor=pointer]:
            - /url: /search
          - link "登录" [ref=e11] [cursor=pointer]:
            - /url: /login
    - generic [ref=e12]:
      - heading "发现精彩小说 开启阅读之旅" [level=1] [ref=e13]:
        - text: 发现精彩小说
        - text: 开启阅读之旅
      - paragraph [ref=e14]: NovelHub 是一个现代化的小说阅读平台，汇聚海量优质作品， 为您提供极致的阅读体验。
      - generic [ref=e15]:
        - link "开始阅读" [ref=e16] [cursor=pointer]:
          - /url: /novels
        - link "注册账号" [ref=e17] [cursor=pointer]:
          - /url: /register
    - generic [ref=e18]:
      - generic [ref=e19]:
        - heading "热门小说" [level=2] [ref=e20]
        - link "查看更多 →" [ref=e21] [cursor=pointer]:
          - /url: /novels
      - generic [ref=e22]: 获取小说列表失败
    - generic [ref=e23]:
      - heading "平台特色" [level=2] [ref=e24]
      - generic [ref=e25]:
        - generic [ref=e26]:
          - generic [ref=e27]: 📚
          - heading "海量小说" [level=3] [ref=e28]
          - paragraph [ref=e29]: 汇聚各类热门小说，满足不同读者的阅读需求
        - generic [ref=e30]:
          - generic [ref=e31]: 🔖
          - heading "个性书架" [level=3] [ref=e32]
          - paragraph [ref=e33]: 智能书架管理，随时记录阅读进度
        - generic [ref=e34]:
          - generic [ref=e35]: 🤖
          - heading "AI 智能体" [level=3] [ref=e36]
          - paragraph [ref=e37]: AI 辅助创作与评审，提升内容质量
    - contentinfo [ref=e38]:
      - paragraph [ref=e40]: © 2026 NovelHub. All rights reserved.
  - alert [ref=e41]
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
> 22  |     await expect(aboutLink).toBeVisible();
      |                             ^ Error: expect(locator).toBeVisible() failed
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
  88  |     await page.waitForLoadState('networkidle');
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
```