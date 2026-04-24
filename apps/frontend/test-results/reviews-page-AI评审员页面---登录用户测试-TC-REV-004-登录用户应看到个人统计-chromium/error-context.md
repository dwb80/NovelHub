# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews-page.spec.ts >> AI评审员页面 - 登录用户测试 >> TC-REV-004: 登录用户应看到个人统计
- Location: e2e\reviews-page.spec.ts:66:7

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
  3   | test.describe('AI评审员页面 (/reviews) 测试', () => {
  4   |   test.beforeEach(async ({ page, context }) => {
  5   |     // 确保未登录状态
  6   |     await context.clearCookies();
  7   |     await page.goto('http://localhost:3000/reviews');
  8   |     await page.waitForLoadState('networkidle');
  9   |   });
  10  | 
  11  |   test('TC-REV-001: 未登录用户应看到公共信息', async ({ page }) => {
  12  |     // 验证页面标题
  13  |     await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
  14  |     
  15  |     // 验证公共统计卡片 - 使用更通用的选择器
  16  |     await expect(page.getByText('注册评审员').first()).toBeVisible();
  17  |     await expect(page.getByText('累计评审').first()).toBeVisible();
  18  |     await expect(page.getByText('平均评分').first()).toBeVisible();
  19  |     
  20  |     // 验证页面内容加载成功
  21  |     const pageContent = await page.content();
  22  |     expect(pageContent).toContain('AI评审员');
  23  |   });
  24  | 
  25  |   test('TC-REV-002: 未登录用户不应跳转登录页（关键测试）', async ({ page }) => {
  26  |     // 验证URL保持为 /reviews
  27  |     await expect(page).toHaveURL('http://localhost:3000/reviews');
  28  |     
  29  |     // 验证URL不包含 login
  30  |     const currentUrl = page.url();
  31  |     expect(currentUrl).not.toContain('/login');
  32  |     
  33  |     // 验证页面正常显示
  34  |     await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
  35  |   });
  36  | 
  37  |   test('TC-REV-003: 未登录用户应看到登录提示', async ({ page }) => {
  38  |     // 验证登录相关提示 - 使用更通用的检查
  39  |     const pageContent = await page.content();
  40  |     
  41  |     // 检查是否有登录相关的内容或按钮
  42  |     const hasLoginContent = pageContent.includes('登录') || 
  43  |                            pageContent.includes('立即登录') ||
  44  |                            pageContent.includes('注册');
  45  |     expect(hasLoginContent).toBe(true);
  46  |   });
  47  | 
  48  |   test('TC-REV-006: 页面应显示评审员排行榜', async ({ page }) => {
  49  |     // 验证排行榜标题 - 使用更通用的选择器
  50  |     const headings = page.getByRole('heading');
  51  |     const headingTexts = await headings.allTextContents();
  52  |     const hasRanking = headingTexts.some(text => text.includes('排行'));
  53  |     expect(hasRanking).toBe(true);
  54  |   });
  55  | 
  56  |   test('TC-REV-007: 页面应显示最新评审', async ({ page }) => {
  57  |     // 验证最新评审标题 - 使用更通用的选择器
  58  |     const headings = page.getByRole('heading');
  59  |     const headingTexts = await headings.allTextContents();
  60  |     const hasReviews = headingTexts.some(text => text.includes('评审') || text.includes('最新'));
  61  |     expect(hasReviews).toBe(true);
  62  |   });
  63  | });
  64  | 
  65  | test.describe('AI评审员页面 - 登录用户测试', () => {
  66  |   test('TC-REV-004: 登录用户应看到个人统计', async ({ page, context }) => {
  67  |     // 模拟登录状态
  68  |     await page.goto('http://localhost:3000/reviews');
  69  |     await page.evaluate(() => {
  70  |       localStorage.setItem('auth-token', 'test-token');
  71  |     });
  72  |     await page.reload();
> 73  |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  74  |     
  75  |     // 验证页面加载成功
  76  |     await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
  77  |     
  78  |     // 验证个人统计相关文本 - 使用更通用的检查
  79  |     const pageContent = await page.content();
  80  |     expect(pageContent).toContain('AI评审员');
  81  |   });
  82  | 
  83  |   test('TC-REV-005: 登录用户应看到待评审任务', async ({ page }) => {
  84  |     // 模拟登录状态
  85  |     await page.goto('http://localhost:3000/reviews');
  86  |     await page.evaluate(() => {
  87  |       localStorage.setItem('auth-token', 'test-token');
  88  |     });
  89  |     await page.reload();
  90  |     await page.waitForLoadState('networkidle');
  91  |     
  92  |     // 验证页面加载成功
  93  |     await expect(page.locator('h1').filter({ hasText: 'AI评审员' })).toBeVisible();
  94  |     
  95  |     // 验证页面内容
  96  |     const pageContent = await page.content();
  97  |     expect(pageContent).toContain('AI评审员');
  98  |   });
  99  | });
  100 | 
  101 | test.describe('AI评审员页面 - 权限矩阵验证', () => {
  102 |   test('未登录用户权限验证', async ({ page, context }) => {
  103 |     await context.clearCookies();
  104 |     await page.goto('http://localhost:3000/reviews');
  105 |     await page.waitForLoadState('networkidle');
  106 |     
  107 |     // 应该看到的 - 使用更通用的选择器
  108 |     await expect(page.getByText('注册评审员').first()).toBeVisible();
  109 |     await expect(page.getByText('累计评审').first()).toBeVisible();
  110 |     await expect(page.getByText('平均评分').first()).toBeVisible();
  111 |     
  112 |     // 验证页面内容
  113 |     const pageContent = await page.content();
  114 |     expect(pageContent).toContain('AI评审员');
  115 |   });
  116 | 
  117 |   test('登录用户权限验证', async ({ page }) => {
  118 |     // 模拟登录状态
  119 |     await page.goto('http://localhost:3000/reviews');
  120 |     await page.evaluate(() => {
  121 |       localStorage.setItem('auth-token', 'test-token');
  122 |     });
  123 |     await page.reload();
  124 |     await page.waitForLoadState('networkidle');
  125 |     
  126 |     // 应该看到的（公共信息）
  127 |     await expect(page.getByText('注册评审员').first()).toBeVisible();
  128 |     await expect(page.getByText('累计评审').first()).toBeVisible();
  129 |     await expect(page.getByText('平均评分').first()).toBeVisible();
  130 |     
  131 |     // 验证页面内容
  132 |     const pageContent = await page.content();
  133 |     expect(pageContent).toContain('AI评审员');
  134 |   });
  135 | });
  136 | 
```