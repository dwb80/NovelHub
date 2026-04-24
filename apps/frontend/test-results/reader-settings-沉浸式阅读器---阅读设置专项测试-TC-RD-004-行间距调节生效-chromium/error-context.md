# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-settings.spec.ts >> 沉浸式阅读器 - 阅读设置专项测试 >> TC-RD-004: 行间距调节生效
- Location: e2e\reader-settings.spec.ts:94:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.evaluate: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.reading-content')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]: 获取小说信息失败
  - alert [ref=e4]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('沉浸式阅读器 - 阅读设置专项测试', () => {
  4   | 
  5   |   test.beforeEach(async ({ context }) => {
  6   |     await context.addInitScript(() => {
  7   |       localStorage.clear();
  8   |     });
  9   |   });
  10  | 
  11  |   test('TC-RD-001: 打开设置面板并切换纯黑暗黑模式', async ({ page }) => {
  12  |     await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
  13  |     await page.waitForLoadState('networkidle');
  14  |     await page.waitForTimeout(2000);
  15  | 
  16  |     await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
  17  |     await page.waitForTimeout(1000);
  18  | 
  19  |     await page.getByRole('tab', { name: '显示' }).click();
  20  |     await page.waitForTimeout(500);
  21  | 
  22  |     console.log('点击前 localStorage:', await page.evaluate(() => localStorage.getItem('reader-preferences')));
  23  | 
  24  |     await page.locator('button:has-text("纯黑暗黑")').click();
  25  |     await page.waitForTimeout(1000);
  26  | 
  27  |     console.log('点击后 localStorage:', await page.evaluate(() => localStorage.getItem('reader-preferences')));
  28  | 
  29  |     const bodyClass = await page.locator('body > div').first().getAttribute('class');
  30  |     console.log('页面容器类名:', bodyClass);
  31  | 
  32  |     const bgColor = await page.evaluate(() => getComputedStyle(document.body.firstElementChild as HTMLElement).backgroundColor);
  33  |     console.log('页面背景色:', bgColor);
  34  | 
  35  |     expect(bodyClass).toContain('reading-mode-dark');
  36  |   });
  37  | 
  38  |   test('TC-RD-002: 三种阅读模式完整切换', async ({ page }) => {
  39  |     await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
  40  |     await page.waitForLoadState('networkidle');
  41  |     await page.waitForTimeout(2000);
  42  | 
  43  |     await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
  44  |     await page.getByRole('tab', { name: '显示' }).click();
  45  | 
  46  |     await page.locator('button:has-text("柔和米黄")').click();
  47  |     await page.waitForTimeout(500);
  48  |     let bodyClass = await page.locator('body > div').first().getAttribute('class');
  49  |     expect(bodyClass).toContain('reading-mode-cream');
  50  | 
  51  |     await page.locator('button:has-text("护眼豆绿")').click();
  52  |     await page.waitForTimeout(500);
  53  |     bodyClass = await page.locator('body > div').first().getAttribute('class');
  54  |     expect(bodyClass).toContain('reading-mode-green');
  55  | 
  56  |     await page.locator('button:has-text("纯黑暗黑")').click();
  57  |     await page.waitForTimeout(500);
  58  |     bodyClass = await page.locator('body > div').first().getAttribute('class');
  59  |     expect(bodyClass).toContain('reading-mode-dark');
  60  |   });
  61  | 
  62  |   test('TC-RD-003: 字体大小调节生效', async ({ page }) => {
  63  |     await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
  64  |     await page.waitForLoadState('networkidle');
  65  |     await page.waitForTimeout(2000);
  66  | 
  67  |     const initialFontSize = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
  68  |     console.log('初始字体大小:', initialFontSize);
  69  | 
  70  |     await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
  71  |     await page.getByRole('tab', { name: '字体' }).click();
  72  |     await page.waitForTimeout(500);
  73  | 
  74  |     const fontSizeBefore = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
  75  |     console.log('打开设置后字体大小:', fontSizeBefore);
  76  | 
  77  |     const slider = page.locator('[role="slider"]').first();
  78  |     const box = await slider.boundingBox();
  79  |     
  80  |     if (box) {
  81  |       await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  82  |       await page.mouse.down();
  83  |       await page.mouse.up();
  84  |     }
  85  | 
  86  |     await page.waitForTimeout(1000);
  87  | 
  88  |     const newFontSize = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).fontSize);
  89  |     console.log('调节后字体大小:', newFontSize);
  90  | 
  91  |     expect(parseFloat(newFontSize)).toBeGreaterThanOrEqual(parseFloat(initialFontSize));
  92  |   });
  93  | 
  94  |   test('TC-RD-004: 行间距调节生效', async ({ page }) => {
  95  |     await page.goto('/novels/8485e1ca-10aa-435a-bd35-3c517e22514b/chapters/456ff460-becd-4243-beb8-987e2aed34c2');
  96  |     await page.waitForLoadState('networkidle');
  97  |     await page.waitForTimeout(2000);
  98  | 
> 99  |     const initialLineHeight = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).lineHeight);
      |                                                                      ^ Error: locator.evaluate: Test timeout of 30000ms exceeded.
  100 |     console.log('初始行高:', initialLineHeight);
  101 | 
  102 |     await page.locator('button:has(svg.lucide-settings)').click({ timeout: 10000 });
  103 |     await page.getByRole('tab', { name: '字体' }).click();
  104 |     await page.waitForTimeout(500);
  105 | 
  106 |     const slider = page.locator('[role="slider"]').nth(1);
  107 |     const box = await slider.boundingBox();
  108 |     
  109 |     if (box) {
  110 |       await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  111 |       await page.mouse.down();
  112 |       await page.mouse.up();
  113 |     }
  114 | 
  115 |     await page.waitForTimeout(1000);
  116 | 
  117 |     const newLineHeight = await page.locator('.reading-content').evaluate(el => getComputedStyle(el).lineHeight);
  118 |     console.log('调节后行高:', newLineHeight);
  119 | 
  120 |     expect(parseFloat(newLineHeight)).toBeGreaterThanOrEqual(parseFloat(initialLineHeight));
  121 |   });
  122 | });
  123 | 
```