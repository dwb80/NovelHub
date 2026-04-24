# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reviews-page-v2.spec.ts >> AI评审员页面 V2 - 完整功能测试 >> TC-REV-V2-001: 页面应显示统计卡片
- Location: e2e\reviews-page-v2.spec.ts:9:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
  1   | ﻿import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('AI评审员页面 V2 - 完整功能测试', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     await page.goto('http://localhost:3000/reviews');
> 6   |     await page.waitForLoadState('networkidle');
      |                ^ Error: page.waitForLoadState: Test timeout of 30000ms exceeded.
  7   |   });
  8   | 
  9   |   test('TC-REV-V2-001: 页面应显示统计卡片', async ({ page }) => {
  10  |     // 检查统计卡片
  11  |     await expect(page.getByText('注册评审员')).toBeVisible();
  12  |     await expect(page.getByText('累计评审')).toBeVisible();
  13  |     await expect(page.getByText('平均评分')).toBeVisible();
  14  |     await expect(page.getByText('待评审任务')).toBeVisible();
  15  |   });
  16  | 
  17  |   test('TC-REV-V2-002: 页面应显示Tab导航', async ({ page }) => {
  18  |     // 检查Tab导航
  19  |     await expect(page.getByRole('tab', { name: '评审员列表' })).toBeVisible();
  20  |     await expect(page.getByRole('tab', { name: '评审规则' })).toBeVisible();
  21  |     await expect(page.getByRole('tab', { name: '申请加入' })).toBeVisible();
  22  |     await expect(page.getByRole('tab', { name: '我的评审' })).toBeVisible();
  23  |   });
  24  | 
  25  |   test('TC-REV-V2-003: 评审员列表应显示评审员卡片', async ({ page }) => {
  26  |     // 等待评审员卡片加载
  27  |     await expect(page.getByText('评审达人')).toBeVisible();
  28  |     await expect(page.getByText('书评专家')).toBeVisible();
  29  |     
  30  |     // 检查评审员信息
  31  |     await expect(page.getByText('积分')).toBeVisible();
  32  |     await expect(page.getByText('评审数')).toBeVisible();
  33  |     await expect(page.getByText('任务数')).toBeVisible();
  34  |   });
  35  | 
  36  |   test('TC-REV-V2-004: 搜索功能应正常工作', async ({ page }) => {
  37  |     // 检查搜索框
  38  |     const searchInput = page.locator('input[placeholder*="搜索评审员"]').first();
  39  |     await expect(searchInput).toBeVisible();
  40  |     
  41  |     // 输入搜索词
  42  |     await searchInput.fill('评审达人');
  43  |     await page.waitForTimeout(500);
  44  |     
  45  |     // 验证搜索结果
  46  |     await expect(page.getByText('评审达人')).toBeVisible();
  47  |   });
  48  | 
  49  |   test('TC-REV-V2-005: 分页功能应正常工作', async ({ page }) => {
  50  |     // 检查分页控件（如果有多个页面）
  51  |     const pagination = page.locator('text=/第.*页/');
  52  |     const hasPagination = await pagination.isVisible().catch(() => false);
  53  |     
  54  |     if (hasPagination) {
  55  |       // 验证分页按钮
  56  |       const nextButton = page.locator('button').filter({ has: page.locator('[data-lucide="chevron-right"]') }).first();
  57  |       const prevButton = page.locator('button').filter({ has: page.locator('[data-lucide="chevron-left"]') }).first();
  58  |       
  59  |       // 上一页按钮应该被禁用（在第一页）
  60  |       await expect(prevButton).toBeDisabled();
  61  |     }
  62  |   });
  63  | 
  64  |   test('TC-REV-V2-006: 评审员详情弹窗应正常显示', async ({ page }) => {
  65  |     // 点击第一个评审员的"查看详情"按钮
  66  |     await page.getByRole('button', { name: '查看详情' }).first().click();
  67  |     
  68  |     // 等待弹窗出现
  69  |     await page.waitForTimeout(500);
  70  |     
  71  |     // 验证弹窗内容
  72  |     await expect(page.getByRole('dialog')).toBeVisible();
  73  |     await expect(page.getByText('总积分')).toBeVisible();
  74  |     await expect(page.getByText('完成评审')).toBeVisible();
  75  |     await expect(page.getByText('当前任务')).toBeVisible();
  76  |     await expect(page.getByText('最近评审')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('TC-REV-V2-007: 评审规则Tab应显示规则内容', async ({ page }) => {
  80  |     // 点击评审规则Tab
  81  |     await page.getByRole('tab', { name: '评审规则' }).click();
  82  |     await page.waitForTimeout(300);
  83  |     
  84  |     // 验证规则内容
  85  |     await expect(page.getByText('评审基本规则')).toBeVisible();
  86  |     await expect(page.getByText('等级考核规则')).toBeVisible();
  87  |     await expect(page.getByText('积分获取规则')).toBeVisible();
  88  |     
  89  |     // 验证具体规则
  90  |     await expect(page.getByText('客观公正')).toBeVisible();
  91  |     await expect(page.getByText('详细具体')).toBeVisible();
  92  |     await expect(page.getByText('见习评审')).toBeVisible();
  93  |     await expect(page.getByText('钻石评审')).toBeVisible();
  94  |   });
  95  | 
  96  |   test('TC-REV-V2-008: 申请加入Tab应显示申请信息', async ({ page }) => {
  97  |     // 点击申请加入Tab
  98  |     await page.getByRole('tab', { name: '申请加入' }).click();
  99  |     await page.waitForTimeout(300);
  100 |     
  101 |     // 验证申请信息
  102 |     await expect(page.getByText('申请成为AI评审员')).toBeVisible();
  103 |     await expect(page.getByText('注册账号')).toBeVisible();
  104 |     await expect(page.getByText('阅读经验')).toBeVisible();
  105 |     await expect(page.locator('text=通过测试').first()).toBeVisible();
  106 |     
```