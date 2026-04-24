# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile-claw-binding.spec.ts >> 个人中心 - AI智能体绑定功能 >> TC-LIST-004: 空状态展示
- Location: e2e\profile-claw-binding.spec.ts:45:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/login
Call log:
  - navigating to "http://localhost:3002/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('个人中心 - AI智能体绑定功能', () => {
  4   |   test('TC-CLAW-001: 访问绑定AI智能体Tab', async ({ page }) => {
  5   |     // 先登录
  6   |     await page.goto('http://localhost:3002/login');
  7   |     await page.waitForLoadState('networkidle');
  8   |     
  9   |     // 填写登录表单 - 使用正确的测试账号
  10  |     await page.fill('#email', 'reader1@example.com');
  11  |     await page.fill('#password', 'reader123');
  12  |     await page.click('button[type="submit"]');
  13  |     
  14  |     // 等待跳转到个人中心
  15  |     await page.waitForURL('**/profile', { timeout: 15000 });
  16  |     
  17  |     // 点击绑定AI智能体Tab
  18  |     await page.click('text=绑定AI智能体');
  19  |     
  20  |     // 验证页面内容
  21  |     await expect(page.locator('text=已绑定的AI智能体').first()).toBeVisible();
  22  |     await expect(page.locator('text=申请成为AI智能体').first()).toBeVisible();
  23  |   });
  24  | 
  25  |   test('TC-CLAW-003: Tab切换功能', async ({ page }) => {
  26  |     await page.goto('http://localhost:3002/login');
  27  |     await page.waitForLoadState('networkidle');
  28  |     
  29  |     await page.fill('#email', 'reader1@example.com');
  30  |     await page.fill('#password', 'reader123');
  31  |     await page.click('button[type="submit"]');
  32  |     await page.waitForURL('**/profile', { timeout: 15000 });
  33  |     
  34  |     await page.click('text=绑定AI智能体');
  35  |     
  36  |     // 切换到AI评审员Tab - 使用更精确的选择器
  37  |     await page.getByRole('tab', { name: 'AI评审员' }).click();
  38  |     await expect(page.getByText('申请成为AI评审员').first()).toBeVisible();
  39  |     
  40  |     // 切换回AI智能体作家Tab
  41  |     await page.getByRole('tab', { name: 'AI智能体作家' }).click();
  42  |     await expect(page.getByText('申请成为AI智能体作家').first()).toBeVisible();
  43  |   });
  44  | 
  45  |   test('TC-LIST-004: 空状态展示', async ({ page }) => {
> 46  |     await page.goto('http://localhost:3002/login');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3002/login
  47  |     await page.waitForLoadState('networkidle');
  48  |     
  49  |     await page.fill('#email', 'reader1@example.com');
  50  |     await page.fill('#password', 'reader123');
  51  |     await page.click('button[type="submit"]');
  52  |     await page.waitForURL('**/profile', { timeout: 15000 });
  53  |     
  54  |     await page.click('text=绑定AI智能体');
  55  |     
  56  |     // 验证空状态
  57  |     await expect(page.locator('text=暂无绑定的AI智能体')).toBeVisible();
  58  |   });
  59  | 
  60  |   test('TC-WRITER-001: 作家申请流程展示', async ({ page }) => {
  61  |     await page.goto('http://localhost:3002/login');
  62  |     await page.waitForLoadState('networkidle');
  63  |     
  64  |     await page.fill('#email', 'reader1@example.com');
  65  |     await page.fill('#password', 'reader123');
  66  |     await page.click('button[type="submit"]');
  67  |     await page.waitForURL('**/profile', { timeout: 15000 });
  68  |     
  69  |     await page.click('text=绑定AI智能体');
  70  |     
  71  |     // 验证4步流程 - 使用精确匹配
  72  |     await expect(page.getByText('注册AI智能体账号', { exact: true })).toBeVisible();
  73  |     await expect(page.getByText('提交作家申请', { exact: true })).toBeVisible();
  74  |     await expect(page.getByText('系统审核', { exact: true })).toBeVisible();
  75  |     await expect(page.getByText('开始创作', { exact: true })).toBeVisible();
  76  |   });
  77  | 
  78  |   test('TC-REVIEWER-001: 评审员申请流程展示', async ({ page }) => {
  79  |     await page.goto('http://localhost:3002/login');
  80  |     await page.waitForLoadState('networkidle');
  81  |     
  82  |     await page.fill('#email', 'reader1@example.com');
  83  |     await page.fill('#password', 'reader123');
  84  |     await page.click('button[type="submit"]');
  85  |     await page.waitForURL('**/profile', { timeout: 15000 });
  86  |     
  87  |     await page.click('text=绑定AI智能体');
  88  |     await page.getByRole('tab', { name: 'AI评审员' }).click();
  89  |     
  90  |     // 验证5步流程
  91  |     await expect(page.getByText('拥有AI智能体身份', { exact: true })).toBeVisible();
  92  |     await expect(page.getByText('提交评审员申请', { exact: true })).toBeVisible();
  93  |     await expect(page.getByText('能力测试', { exact: true })).toBeVisible();
  94  |     await expect(page.getByText('人工审核', { exact: true })).toBeVisible();
  95  |     await expect(page.getByText('开始评审', { exact: true })).toBeVisible();
  96  |   });
  97  | 
  98  |   test('TC-COMMON-002: 重要说明展示', async ({ page }) => {
  99  |     await page.goto('http://localhost:3002/login');
  100 |     await page.waitForLoadState('networkidle');
  101 |     
  102 |     await page.fill('#email', 'reader1@example.com');
  103 |     await page.fill('#password', 'reader123');
  104 |     await page.click('button[type="submit"]');
  105 |     await page.waitForURL('**/profile', { timeout: 15000 });
  106 |     
  107 |     await page.click('text=绑定AI智能体');
  108 |     
  109 |     // 验证重要说明
  110 |     await expect(page.locator('text=重要说明')).toBeVisible();
  111 |     await expect(page.locator('text=同一个AI智能体可以同时拥有作家和评审员两种身份')).toBeVisible();
  112 |   });
  113 | });
  114 | 
```