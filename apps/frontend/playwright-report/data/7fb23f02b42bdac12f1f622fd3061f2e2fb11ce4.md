# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-retention-features.spec.ts >> 沉浸式阅读器 - 四大留存杀手级功能 E2E 测试 >> 基础渲染验证 >> 小说详情页正常访问
- Location: e2e\reader-retention-features.spec.ts:247:9

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
  3   | test.describe('沉浸式阅读器 - 四大留存杀手级功能 E2E 测试', () => {
  4   | 
  5   |   async function gotoNovelList(page: any) {
  6   |     await page.goto('/novels');
> 7   |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  8   |   }
  9   | 
  10  |   async function gotoFirstNovelDetail(page: any) {
  11  |     await gotoNovelList(page);
  12  |     await page.waitForSelector('a[href*="/novels/"]', { timeout: 10000 });
  13  |     const novelLinks = await page.locator('a[href*="/novels/"]').all();
  14  |     for (const link of novelLinks) {
  15  |       const href = await link.getAttribute('href');
  16  |       if (href && !href.includes('/chapters/')) {
  17  |         await link.click();
  18  |         break;
  19  |       }
  20  |     }
  21  |     await page.waitForURL(/\/novels\//);
  22  |     await page.waitForLoadState('networkidle');
  23  |   }
  24  | 
  25  |   test.beforeEach(async ({ context }) => {
  26  |     await context.addInitScript(() => {
  27  |       localStorage.clear();
  28  |     });
  29  |   });
  30  | 
  31  |   test.describe('【功能1】智能预加载 - 70% 位置自动预加载下一章', () => {
  32  | 
  33  |     test('TC-PRE-001: 滚动到70%位置时触发下一章API预加载', async ({ page }) => {
  34  |       await gotoFirstNovelDetail(page);
  35  |       
  36  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  37  |       if (await chapterLinks.count() > 0) {
  38  |         await Promise.all([
  39  |           page.waitForNavigation(),
  40  |           chapterLinks.first().click()
  41  |         ]);
  42  |         await page.waitForLoadState('networkidle');
  43  | 
  44  |         let apiCalled = false;
  45  |         page.on('request', (request: any) => {
  46  |           const url = request.url();
  47  |           if (url.includes('/chapters/') && request.method() === 'GET') {
  48  |             apiCalled = true;
  49  |           }
  50  |         });
  51  | 
  52  |         await page.evaluate(() => {
  53  |           const scrollHeight = document.documentElement.scrollHeight;
  54  |           const target = scrollHeight * 0.7;
  55  |           window.scrollTo(0, target);
  56  |         });
  57  | 
  58  |         await page.waitForTimeout(2000);
  59  |         expect(apiCalled).toBeTruthy();
  60  |       }
  61  |     });
  62  | 
  63  |     test('TC-PRE-002: 预加载只触发一次避免重复请求', async ({ page }) => {
  64  |       test.skip(true, '需要更精确的请求计数验证');
  65  |     });
  66  | 
  67  |   });
  68  | 
  69  |   test.describe('【功能2】无缝章节衔接 - 末尾自动嵌入下一章开头', () => {
  70  | 
  71  |     test('TC-SEAM-001: 章节末尾显示下一章无缝衔接提示', async ({ page }) => {
  72  |       await gotoFirstNovelDetail(page);
  73  |       
  74  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  75  |       if (await chapterLinks.count() > 0) {
  76  |         await Promise.all([
  77  |           page.waitForNavigation(),
  78  |           chapterLinks.first().click()
  79  |         ]);
  80  |         await page.waitForLoadState('networkidle');
  81  | 
  82  |         await page.evaluate(() => {
  83  |           window.scrollTo(0, document.body.scrollHeight);
  84  |         });
  85  |         await page.waitForTimeout(1000);
  86  | 
  87  |         const seamlessBanner = page.getByText(/无缝衔接阅读/);
  88  |         await expect(seamlessBanner).toBeVisible();
  89  |       }
  90  |     });
  91  | 
  92  |     test('TC-SEAM-002: 显示下一章标题和章节号', async ({ page }) => {
  93  |       await gotoFirstNovelDetail(page);
  94  |       
  95  |       const chapterLinks = page.locator('a[href*="/chapters/"]');
  96  |       if (await chapterLinks.count() > 0) {
  97  |         await Promise.all([
  98  |           page.waitForNavigation(),
  99  |           chapterLinks.first().click()
  100 |         ]);
  101 |         await page.waitForLoadState('networkidle');
  102 | 
  103 |         await page.evaluate(() => {
  104 |           window.scrollTo(0, document.body.scrollHeight);
  105 |         });
  106 |         await page.waitForTimeout(1000);
  107 | 
```