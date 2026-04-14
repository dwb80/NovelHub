# NovelHub E2E 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12  
**测试框架**: Playwright

---

## 测试概述

### 测试范围

| 模块 | 测试场景数 | 优先级 |
|------|------------|--------|
| 用户认证 | 15 | P0 |
| 小说阅读 | 20 | P0 |
| 书架管理 | 12 | P0 |
| 搜索发现 | 10 | P1 |
| 评论互动 | 8 | P1 |
| 创作管理 | 15 | P1 |

### 测试环境

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 用户认证测试

### TC-E2E-AUTH-001: 用户完整注册流程

```typescript
test('用户完整注册流程', async ({ page }) => {
  // Arrange
  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test@123456'
  };
  
  // Act
  await page.goto('/register');
  await page.fill('[data-testid="username-input"]', userData.username);
  await page.fill('[data-testid="email-input"]', userData.email);
  await page.fill('[data-testid="password-input"]', userData.password);
  await page.fill('[data-testid="confirm-password-input"]', userData.password);
  await page.click('[data-testid="register-button"]');
  
  // Assert
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  await expect(page.locator('[data-testid="toast-success"]')).toContainText('注册成功');
});
```

### TC-E2E-AUTH-002: 用户登录与登出

```typescript
test('用户登录与登出', async ({ page }) => {
  // 登录
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // 登出
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  
  await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
});
```

### TC-E2E-AUTH-003: 登录状态保持

```typescript
test('登录状态保持', async ({ page, context }) => {
  // 登录并记住我
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.check('[data-testid="remember-me"]');
  await page.click('[data-testid="login-button"]');
  
  // 保存存储状态
  const storageState = await context.storageState();
  
  // 使用新上下文，恢复存储状态
  const newContext = await browser.newContext({ storageState });
  const newPage = await newContext.newPage();
  await newPage.goto('/');
  
  // 验证仍然登录
  await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

---

## 小说阅读测试

### TC-E2E-READ-001: 从首页到阅读完整流程

```typescript
test('从首页到阅读完整流程', async ({ page }) => {
  // 访问首页
  await page.goto('/');
  
  // 点击第一本小说
  await page.click('[data-testid="novel-card"]:first-child');
  await expect(page).toHaveURL(/\/novel\/\d+/);
  
  // 验证详情页
  await expect(page.locator('[data-testid="novel-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="novel-author"]')).toBeVisible();
  
  // 点击开始阅读
  await page.click('[data-testid="start-reading-button"]');
  await expect(page).toHaveURL(/\/reader\/\d+/);
  
  // 验证阅读器
  await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible();
  await expect(page.locator('[data-testid="chapter-title"]')).toBeVisible();
});
```

### TC-E2E-READ-002: 阅读器翻页与导航

```typescript
test('阅读器翻页与导航', async ({ page }) => {
  await page.goto('/reader/1');
  
  // 获取初始章节标题
  const initialTitle = await page.locator('[data-testid="chapter-title"]').textContent();
  
  // 点击下一章
  await page.click('[data-testid="next-chapter-button"]');
  await page.waitForLoadState('networkidle');
  
  // 验证章节变化
  const newTitle = await page.locator('[data-testid="chapter-title"]').textContent();
  expect(newTitle).not.toBe(initialTitle);
  
  // 点击目录
  await page.click('[data-testid="toc-button"]');
  await expect(page.locator('[data-testid="toc-panel"]')).toBeVisible();
  
  // 选择特定章节
  await page.click('[data-testid="toc-chapter-5"]');
  await expect(page.locator('[data-testid="chapter-title"]')).toContainText('第五章');
});
```

### TC-E2E-READ-003: 阅读设置调整

```typescript
test('阅读设置调整', async ({ page }) => {
  await page.goto('/reader/1');
  
  // 打开设置面板
  await page.click('[data-testid="settings-button"]');
  await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible();
  
  // 调整字体大小
  await page.click('[data-testid="font-size-increase"]');
  const fontSize = await page.locator('[data-testid="chapter-content"]').evaluate(
    el => window.getComputedStyle(el).fontSize
  );
  expect(fontSize).toBe('18px');
  
  // 切换主题
  await page.click('[data-testid="theme-dark"]');
  const bgColor = await page.locator('[data-testid="reader-container"]').evaluate(
    el => window.getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toBe('rgb(30, 30, 30)');
  
  // 保存设置
  await page.click('[data-testid="save-settings"]');
  await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
});
```

---

## 书架管理测试

### TC-E2E-BS-001: 加入书架与查看

```typescript
test('加入书架与查看', async ({ page }) => {
  // 登录
  await login(page, 'test@example.com', 'password123');
  
  // 访问小说详情
  await page.goto('/novel/1');
  
  // 加入书架
  await page.click('[data-testid="add-to-bookshelf-button"]');
  await expect(page.locator('[data-testid="toast-success"]')).toContainText('已加入书架');
  
  // 按钮状态变化
  await expect(page.locator('[data-testid="add-to-bookshelf-button"]')).toContainText('已在书架');
  
  // 查看书架
  await page.goto('/bookshelf');
  await expect(page.locator('[data-testid="bookshelf-item"]')).toContainText('测试小说');
});
```

### TC-E2E-BS-002: 阅读进度同步

```typescript
test('阅读进度同步', async ({ page }) => {
  await login(page, 'test@example.com', 'password123');
  
  // 阅读小说并记录进度
  await page.goto('/reader/1');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000); // 等待自动保存
  
  // 返回书架
  await page.goto('/bookshelf');
  
  // 验证进度显示
  const progressText = await page.locator('[data-testid="reading-progress"]').textContent();
  expect(progressText).toMatch(/\d+%/);
  
  // 点击继续阅读
  await page.click('[data-testid="continue-reading-button"]');
  
  // 验证回到正确位置
  const scrollPosition = await page.evaluate(() => window.scrollY);
  expect(scrollPosition).toBeGreaterThan(0);
});
```

---

## 搜索发现测试

### TC-E2E-SEARCH-001: 关键词搜索

```typescript
test('关键词搜索', async ({ page }) => {
  await page.goto('/search');
  
  // 输入搜索词
  await page.fill('[data-testid="search-input"]', '修仙');
  await page.press('[data-testid="search-input"]', 'Enter');
  
  // 验证搜索结果
  await expect(page).toHaveURL(/\/search\?q=修仙/);
  await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount.greaterThan(0);
  
  // 验证结果包含关键词
  const firstResult = await page.locator('[data-testid="search-result-item"]:first-child').textContent();
  expect(firstResult).toContain('修仙');
});
```

### TC-E2E-SEARCH-002: 搜索过滤与排序

```typescript
test('搜索过滤与排序', async ({ page }) => {
  await page.goto('/search?q=修仙');
  
  // 按分类过滤
  await page.selectOption('[data-testid="category-filter"]', '仙侠');
  await page.waitForLoadState('networkidle');
  
  // 验证URL更新
  await expect(page).toHaveURL(/category=仙侠/);
  
  // 按字数排序
  await page.click('[data-testid="sort-by-wordcount"]');
  await page.waitForLoadState('networkidle');
  
  // 验证排序结果
  const wordCounts = await page.locator('[data-testid="word-count"]').allTextContents();
  const sorted = [...wordCounts].sort((a, b) => parseInt(b) - parseInt(a));
  expect(wordCounts).toEqual(sorted);
});
```

---

## 评论互动测试

### TC-E2E-COMMENT-001: 发表评论

```typescript
test('发表评论', async ({ page }) => {
  await login(page, 'test@example.com', 'password123');
  await page.goto('/novel/1');
  
  // 滚动到评论区
  await page.locator('[data-testid="comment-section"]').scrollIntoViewIfNeeded();
  
  // 输入评论
  await page.fill('[data-testid="comment-input"]', '这本小说真好看！');
  await page.click('[data-testid="submit-comment-button"]');
  
  // 验证评论发布
  await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="comment-item"]:first-child')).toContainText('这本小说真好看！');
});
```

### TC-E2E-COMMENT-002: 评论点赞

```typescript
test('评论点赞', async ({ page }) => {
  await login(page, 'test@example.com', 'password123');
  await page.goto('/novel/1');
  
  // 获取初始点赞数
  const initialCount = await page.locator('[data-testid="like-count"]:first-child').textContent();
  
  // 点击点赞
  await page.click('[data-testid="like-button"]:first-child');
  
  // 验证点赞数增加
  const newCount = await page.locator('[data-testid="like-count"]:first-child').textContent();
  expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
  
  // 验证按钮状态
  await expect(page.locator('[data-testid="like-button"]:first-child')).toHaveClass(/liked/);
});
```

---

## 创作管理测试

### TC-E2E-AUTHOR-001: 创建小说

```typescript
test('创建小说', async ({ page }) => {
  await loginAsAuthor(page);
  await page.goto('/author/novels/create');
  
  // 填写小说信息
  await page.fill('[data-testid="novel-title-input"]', '我的测试小说');
  await page.fill('[data-testid="novel-summary-input"]', '这是一本测试用的小说简介');
  await page.selectOption('[data-testid="novel-category-select"]', '仙侠');
  
  // 上传封面
  await page.setInputFiles('[data-testid="cover-upload"]', 'test-assets/cover.jpg');
  await expect(page.locator('[data-testid="cover-preview"]')).toBeVisible();
  
  // 添加标签
  await page.fill('[data-testid="tag-input"]', '修仙');
  await page.press('[data-testid="tag-input"]', 'Enter');
  
  // 保存草稿
  await page.click('[data-testid="save-draft-button"]');
  await expect(page.locator('[data-testid="toast-success"]')).toContainText('保存成功');
  
  // 验证跳转
  await expect(page).toHaveURL('/author/novels');
});
```

### TC-E2E-AUTHOR-002: 发布章节

```typescript
test('发布章节', async ({ page }) => {
  await loginAsAuthor(page);
  await page.goto('/author/novels/1/chapters/create');
  
  // 填写章节信息
  await page.fill('[data-testid="chapter-title-input"]', '测试章节标题');
  await page.fill('[data-testid="chapter-content-input"]', '这是章节内容，至少100字...'.repeat(10));
  
  // 设置VIP
  await page.check('[data-testid="vip-checkbox"]');
  await page.fill('[data-testid="chapter-price-input"]', '10');
  
  // 发布
  await page.click('[data-testid="publish-button"]');
  await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
  await page.click('[data-testid="confirm-publish"]');
  
  // 验证发布成功
  await expect(page.locator('[data-testid="toast-success"]')).toContainText('发布成功');
});
```

---

## 测试辅助函数

```typescript
// tests/e2e/helpers.ts

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}

export async function loginAsAuthor(page: Page) {
  await login(page, 'author@test.com', 'password123');
}

export async function createTestNovel(page: Page, title: string) {
  await page.goto('/author/novels/create');
  await page.fill('[data-testid="novel-title-input"]', title);
  await page.fill('[data-testid="novel-summary-input"]', '测试简介');
  await page.selectOption('[data-testid="novel-category-select"]', '仙侠');
  await page.click('[data-testid="save-draft-button"]');
  await page.waitForURL('/author/novels');
}
```

---

## 测试数据管理

```typescript
// tests/e2e/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend<{
  testUser: { email: string; password: string };
  authorUser: { email: string; password: string };
}>({
  testUser: async ({}, use) => {
    await use({
      email: `test_${Date.now()}@example.com`,
      password: 'Test@123456'
    });
  },
  authorUser: async ({}, use) => {
    await use({
      email: 'author@test.com',
      password: 'password123'
    });
  },
});
```

---

## 运行命令

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行特定测试文件
npm run test:e2e -- tests/e2e/auth.spec.ts

# 运行特定测试
npm run test:e2e -- -g "用户完整注册流程"

# 调试模式
npm run test:e2e -- --debug

# 生成报告
npm run test:e2e -- --reporter=html
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
