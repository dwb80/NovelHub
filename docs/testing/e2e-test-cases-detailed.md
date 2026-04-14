# NovelHub E2E 测试用例详细设计

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 用户认证模块

### TC-E2E-AUTH-001: 用户注册 - 成功场景

**测试目标**: 验证用户使用有效信息可以成功注册

**前置条件**:
- 注册页面可访问
- 测试邮箱未被注册

**测试数据**:
```typescript
const userData = {
  username: `e2e_user_${Date.now()}`,
  email: `e2e_${Date.now()}@test.com`,
  password: 'Test@123456',
  confirmPassword: 'Test@123456'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | Playwright代码 |
|------|------|----------|----------------|
| 1 | 访问注册页面 | 页面加载，显示注册表单 | `await page.goto('/register');` |
| 2 | 输入用户名 | 用户名显示在输入框 | `await page.fill('[data-testid="username"]', userData.username);` |
| 3 | 输入邮箱 | 邮箱显示在输入框 | `await page.fill('[data-testid="email"]', userData.email);` |
| 4 | 输入密码 | 密码以掩码显示 | `await page.fill('[data-testid="password"]', userData.password);` |
| 5 | 输入确认密码 | 确认密码显示 | `await page.fill('[data-testid="confirmPassword"]', userData.confirmPassword);` |
| 6 | 点击注册按钮 | 显示加载状态 | `await page.click('[data-testid="register-btn"]');` |
| 7 | 等待注册完成 | 跳转至首页 | `await expect(page).toHaveURL('/');` |

**预期结果**:
- ✅ 注册成功，自动登录
- ✅ 显示成功提示"注册成功，欢迎加入NovelHub"
- ✅ 跳转至首页
- ✅ 用户菜单显示用户名
- ✅ 数据库创建用户记录

**验证检查点**:
```typescript
await expect(page.locator('[data-testid="toast-success"]')).toContainText('注册成功');
await expect(page.locator('[data-testid="user-menu"]')).toContainText(userData.username);
await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
```

---

### TC-E2E-AUTH-002: 用户注册 - 邮箱已存在

**测试目标**: 验证系统对重复邮箱的校验

**测试数据**:
```typescript
const existingUser = {
  username: 'newuser123',
  email: 'existing@test.com', // 已存在的邮箱
  password: 'Test@123456'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 访问注册页面 | 页面加载 |
| 2 | 填写已存在的邮箱 | 输入框显示邮箱 |
| 3 | 填写其他信息 | 信息填写完成 |
| 4 | 点击注册 | 显示错误提示 |

**预期结果**:
- ✅ 显示错误提示"该邮箱已被注册"
- ✅ 邮箱输入框高亮显示错误
- ✅ 页面不跳转
- ✅ 其他输入保留

**验证代码**:
```typescript
await expect(page.locator('[data-testid="email-error"]')).toContainText('该邮箱已被注册');
await expect(page.locator('[data-testid="email-input"]')).toHaveClass(/error/);
await expect(page).toHaveURL('/register');
```

---

### TC-E2E-AUTH-003: 用户登录 - 成功场景

**测试目标**: 验证用户使用正确凭据可以登录

**测试数据**:
```typescript
const credentials = {
  email: 'test@example.com',
  password: 'Test@123456'
};
```

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 代码 |
|------|------|----------|------|
| 1 | 访问登录页 | 显示登录表单 | `await page.goto('/login');` |
| 2 | 输入邮箱 | 邮箱显示 | `await page.fill('[data-testid="email"]', credentials.email);` |
| 3 | 输入密码 | 密码掩码显示 | `await page.fill('[data-testid="password"]', credentials.password);` |
| 4 | 点击登录 | 加载中 | `await page.click('[data-testid="login-btn"]');` |
| 5 | 验证跳转 | 跳转首页 | `await expect(page).toHaveURL('/');` |

**预期结果**:
- ✅ 登录成功
- ✅ 显示欢迎消息
- ✅ 用户菜单可见
- ✅ Token存储在localStorage

**验证代码**:
```typescript
await expect(page.locator('[data-testid="toast-success"]')).toContainText('欢迎回来');
await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
const token = await page.evaluate(() => localStorage.getItem('auth_token'));
expect(token).toBeTruthy();
```

---

### TC-E2E-AUTH-004: 用户登录 - 密码错误

**测试目标**: 验证系统对错误密码的处理

**测试数据**:
```typescript
const wrongCredentials = {
  email: 'test@example.com',
  password: 'WrongPassword123'
};
```

**预期结果**:
- ✅ 显示错误提示"邮箱或密码错误"
- ✅ 登录按钮可再次点击
- ✅ 密码输入框清空

**验证代码**:
```typescript
await expect(page.locator('[data-testid="login-error"]')).toContainText('邮箱或密码错误');
await expect(page.locator('[data-testid="password-input"]')).toHaveValue('');
```

---

### TC-E2E-AUTH-005: 登录状态保持

**测试目标**: 验证"记住我"功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 登录时勾选"记住我" | 登录成功 |
| 2 | 关闭浏览器 | 浏览器关闭 |
| 3 | 重新打开浏览器访问 | 仍保持登录状态 |

**验证代码**:
```typescript
// 登录并记住
await page.check('[data-testid="remember-me"]');
await page.click('[data-testid="login-btn"]');

// 保存存储状态
const storageState = await context.storageState();

// 新上下文
const newContext = await browser.newContext({ storageState });
const newPage = await newContext.newPage();
await newPage.goto('/');

// 验证仍登录
await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();
```

---

## 2. 小说阅读模块

### TC-E2E-READ-001: 阅读流程 - 从首页到阅读器

**测试目标**: 验证完整阅读流程

**测试步骤**:

| 步骤 | 操作 | 预期结果 | 代码 |
|------|------|----------|------|
| 1 | 访问首页 | 首页加载 | `await page.goto('/');` |
| 2 | 点击小说卡片 | 跳转详情页 | `await page.click('[data-testid="novel-card"]:first-child');` |
| 3 | 验证详情页 | 显示小说信息 | `await expect(page.locator('[data-testid="novel-title"]')).toBeVisible();` |
| 4 | 点击开始阅读 | 跳转阅读器 | `await page.click('[data-testid="start-reading"]');` |
| 5 | 验证阅读器 | 显示章节内容 | `await expect(page.locator('[data-testid="chapter-content"]')).toBeVisible();` |

**预期结果**:
- ✅ 首页显示小说列表
- ✅ 详情页显示完整信息
- ✅ 阅读器正确加载
- ✅ 章节内容可阅读

---

### TC-E2E-READ-002: 阅读器 - 章节导航

**测试目标**: 验证章节切换功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 打开阅读器 | 显示第一章 |
| 2 | 点击下一章 | 加载第二章 |
| 3 | 点击目录 | 显示目录面板 |
| 4 | 选择第10章 | 跳转第10章 |
| 5 | 点击上一章 | 回到第9章 |

**验证代码**:
```typescript
// 获取初始标题
const title1 = await page.locator('[data-testid="chapter-title"]').textContent();

// 下一章
await page.click('[data-testid="next-chapter"]');
await page.waitForLoadState('networkidle');
const title2 = await page.locator('[data-testid="chapter-title"]').textContent();
expect(title2).not.toBe(title1);

// 打开目录
await page.click('[data-testid="toc-button"]');
await expect(page.locator('[data-testid="toc-panel"]')).toBeVisible();

// 选择章节
await page.click('[data-testid="toc-chapter-10"]');
await expect(page.locator('[data-testid="chapter-title"]')).toContainText('第十章');
```

---

### TC-E2E-READ-003: 阅读器 - 设置调整

**测试目标**: 验证阅读设置功能

**测试步骤**:

| 设置项 | 操作 | 预期结果 |
|--------|------|----------|
| 字体大小 | 点击增大按钮 | 字体变大 |
| 背景色 | 选择护眼模式 | 背景变绿 |
| 行间距 | 选择宽间距 | 行距增大 |
| 翻页模式 | 选择左右翻页 | 翻页方式改变 |

**验证代码**:
```typescript
// 打开设置
await page.click('[data-testid="settings-btn"]');

// 增大字体
const initialSize = await page.evaluate(() => 
  getComputedStyle(document.querySelector('[data-testid="content"]')).fontSize
);
await page.click('[data-testid="font-size-up"]');
const newSize = await page.evaluate(() => 
  getComputedStyle(document.querySelector('[data-testid="content"]')).fontSize
);
expect(parseInt(newSize)).toBeGreaterThan(parseInt(initialSize));

// 切换主题
await page.click('[data-testid="theme-eye-care"]');
const bgColor = await page.evaluate(() => 
  getComputedStyle(document.querySelector('[data-testid="reader"]')).backgroundColor
);
expect(bgColor).toBe('rgb(199, 237, 204)');
```

---

### TC-E2E-READ-004: 阅读进度 - 自动保存

**测试目标**: 验证阅读进度自动保存

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 登录并阅读 | 进入阅读器 |
| 2 | 滚动到中间位置 | 页面滚动 |
| 3 | 等待5秒 | 自动保存触发 |
| 4 | 返回书架 | 显示阅读进度 |
| 5 | 点击继续阅读 | 回到原位置 |

**验证代码**:
```typescript
await login(page, 'test@example.com', 'password123');
await page.goto('/reader/1');

// 滚动
await page.evaluate(() => window.scrollTo(0, 1000));
await page.waitForTimeout(5000); // 等待自动保存

// 返回书架
await page.goto('/bookshelf');
const progress = await page.locator('[data-testid="progress-bar"]:first-child').getAttribute('style');
expect(progress).toMatch(/width: \d+%/);

// 继续阅读
await page.click('[data-testid="continue-btn"]:first-child');
const scrollY = await page.evaluate(() => window.scrollY);
expect(scrollY).toBeGreaterThan(0);
```

---

## 3. 书架管理模块

### TC-E2E-BS-001: 加入书架

**测试目标**: 验证加入书架功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 登录用户 | 登录成功 |
| 2 | 访问小说详情 | 显示详情页 |
| 3 | 点击加入书架 | 显示成功提示 |
| 4 | 按钮状态变化 | 显示"已在书架" |
| 5 | 访问书架 | 小说在列表中 |

**验证代码**:
```typescript
await login(page, 'test@example.com', 'password123');
await page.goto('/novel/1');

// 加入书架
await page.click('[data-testid="add-bookshelf"]');
await expect(page.locator('[data-testid="toast-success"]')).toContainText('已加入书架');

// 按钮状态
await expect(page.locator('[data-testid="add-bookshelf"]')).toContainText('已在书架');
await expect(page.locator('[data-testid="add-bookshelf"]')).toBeDisabled();

// 书架验证
await page.goto('/bookshelf');
await expect(page.locator('[data-testid="bookshelf-item"]')).toContainText('测试小说');
```

---

### TC-E2E-BS-002: 书架管理 - 删除

**测试目标**: 验证从书架删除小说

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 访问书架 | 显示书架列表 |
| 2 | 点击删除 | 显示确认对话框 |
| 3 | 确认删除 | 小说从列表移除 |
| 4 | 验证删除 | 列表更新 |

**验证代码**:
```typescript
await login(page, 'test@example.com', 'password123');
await page.goto('/bookshelf');

const initialCount = await page.locator('[data-testid="bookshelf-item"]').count();

// 删除
await page.click('[data-testid="delete-btn"]:first-child');
await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
await page.click('[data-testid="confirm-delete"]');

// 验证
await expect(page.locator('[data-testid="bookshelf-item"]')).toHaveCount(initialCount - 1);
await expect(page.locator('[data-testid="toast-success"]')).toContainText('已删除');
```

---

## 4. 搜索发现模块

### TC-E2E-SEARCH-001: 关键词搜索

**测试目标**: 验证搜索功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 访问搜索页 | 搜索页加载 |
| 2 | 输入关键词 | 显示搜索建议 |
| 3 | 执行搜索 | 显示结果列表 |
| 4 | 验证结果 | 结果包含关键词 |

**验证代码**:
```typescript
await page.goto('/search');

// 输入关键词
await page.fill('[data-testid="search-input"]', '修仙');
await expect(page.locator('[data-testid="search-suggestion"]')).toBeVisible();

// 执行搜索
await page.press('[data-testid="search-input"]', 'Enter');
await expect(page).toHaveURL(/\/search\?q=修仙/);

// 验证结果
const results = await page.locator('[data-testid="search-result"]').count();
expect(results).toBeGreaterThan(0);

const firstResult = await page.locator('[data-testid="search-result"]:first-child').textContent();
expect(firstResult.toLowerCase()).toContain('修仙');
```

---

### TC-E2E-SEARCH-002: 高级搜索

**测试目标**: 验证筛选和排序功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 执行搜索 | 显示结果 |
| 2 | 选择分类 | 结果过滤 |
| 3 | 选择状态 | 进一步过滤 |
| 4 | 选择排序 | 结果重排 |

**验证代码**:
```typescript
await page.goto('/search?q=修仙');

// 分类过滤
await page.selectOption('[data-testid="category-filter"]', '仙侠');
await page.waitForLoadState('networkidle');
await expect(page).toHaveURL(/category=仙侠/);

// 状态过滤
await page.selectOption('[data-testid="status-filter"]', 'completed');
await page.waitForLoadState('networkidle');
await expect(page).toHaveURL(/status=completed/);

// 排序
await page.click('[data-testid="sort-update"]');
await page.waitForLoadState('networkidle');
const url = page.url();
expect(url).toContain('sort=update');
```

---

## 5. 评论互动模块

### TC-E2E-COMMENT-001: 发表评论

**测试目标**: 验证评论发布功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 登录并访问小说 | 显示详情页 |
| 2 | 滚动到评论区 | 评论区可见 |
| 3 | 输入评论 | 内容显示 |
| 4 | 选择评分 | 评分选中 |
| 5 | 提交评论 | 评论发布成功 |

**验证代码**:
```typescript
await login(page, 'test@example.com', 'password123');
await page.goto('/novel/1');

// 滚动到评论区
await page.locator('[data-testid="comment-section"]').scrollIntoViewIfNeeded();

// 输入评论
const commentText = '这本小说写得真不错！';
await page.fill('[data-testid="comment-input"]', commentText);

// 选择评分
await page.click('[data-testid="rating-star-5"]');

// 提交
await page.click('[data-testid="submit-comment"]');

// 验证
await expect(page.locator('[data-testid="toast-success"]')).toContainText('评论成功');
await expect(page.locator('[data-testid="comment-item"]:first-child')).toContainText(commentText);
```

---

### TC-E2E-COMMENT-002: 评论点赞

**测试目标**: 验证评论点赞功能

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 登录并访问小说 | 显示详情页 |
| 2 | 找到评论 | 评论列表显示 |
| 3 | 点击点赞 | 点赞数+1 |
| 4 | 再次点击 | 取消点赞 |

**验证代码**:
```typescript
await login(page, 'test@example.com', 'password123');
await page.goto('/novel/1');
await page.locator('[data-testid="comment-section"]').scrollIntoViewIfNeeded();

// 获取初始点赞数
const initialCount = await page.locator('[data-testid="like-count"]:first-child').textContent();

// 点赞
await page.click('[data-testid="like-btn"]:first-child');
await expect(page.locator('[data-testid="like-btn"]:first-child')).toHaveClass(/liked/);

const newCount = await page.locator('[data-testid="like-count"]:first-child').textContent();
expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);

// 取消点赞
await page.click('[data-testid="like-btn"]:first-child');
await expect(page.locator('[data-testid="like-btn"]:first-child')).not.toHaveClass(/liked/);
```

---

## 6. 创作管理模块

### TC-E2E-AUTHOR-001: 创建小说

**测试目标**: 验证作者创建小说流程

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 以作者身份登录 | 登录成功 |
| 2 | 进入创作中心 | 显示创作页 |
| 3 | 点击创建小说 | 显示创建表单 |
| 4 | 填写信息 | 信息填写完成 |
| 5 | 上传封面 | 封面预览显示 |
| 6 | 保存草稿 | 保存成功 |

**验证代码**:
```typescript
await login(page, 'author@test.com', 'password123');
await page.goto('/author/novels/create');

// 填写信息
const novelTitle = `测试小说_${Date.now()}`;
await page.fill('[data-testid="novel-title"]', novelTitle);
await page.fill('[data-testid="novel-summary"]', '这是一本测试小说');
await page.selectOption('[data-testid="novel-category"]', '仙侠');

// 上传封面
await page.setInputFiles('[data-testid="cover-upload"]', 'test-assets/test-cover.jpg');
await expect(page.locator('[data-testid="cover-preview"]')).toBeVisible();

// 保存
await page.click('[data-testid="save-draft"]');
await expect(page.locator('[data-testid="toast-success"]')).toContainText('保存成功');
await expect(page).toHaveURL('/author/novels');

// 验证列表
await expect(page.locator('[data-testid="novel-list-item"]')).toContainText(novelTitle);
```

---

### TC-E2E-AUTHOR-002: 发布章节

**测试目标**: 验证章节发布流程

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | 进入小说管理 | 显示章节列表 |
| 2 | 点击新建章节 | 显示编辑器 |
| 3 | 填写标题 | 标题显示 |
| 4 | 填写内容 | 内容显示 |
| 5 | 设置VIP | VIP选项选中 |
| 6 | 发布章节 | 发布成功 |

**验证代码**:
```typescript
await login(page, 'author@test.com', 'password123');
await page.goto('/author/novels/1/chapters/create');

// 填写章节
await page.fill('[data-testid="chapter-title"]', '测试章节');
await page.fill('[data-testid="chapter-content"]', '这是章节内容'.repeat(50));

// 设置VIP
await page.check('[data-testid="vip-checkbox"]');
await page.fill('[data-testid="chapter-price"]', '10');

// 发布
await page.click('[data-testid="publish-btn"]');
await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
await page.click('[data-testid="confirm-publish"]');

// 验证
await expect(page.locator('[data-testid="toast-success"]')).toContainText('发布成功');
await expect(page).toHaveURL('/author/novels/1/chapters');
```

---

## 7. 测试工具函数

```typescript
// tests/e2e/utils/helpers.ts

/**
 * 用户登录
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/');
}

/**
 * 作者登录
 */
export async function loginAsAuthor(page: Page): Promise<void> {
  await login(page, 'author@test.com', 'password123');
}

/**
 * 管理员登录
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, 'admin@test.com', 'password123');
}

/**
 * 创建测试小说
 */
export async function createTestNovel(page: Page, title: string): Promise<string> {
  await page.goto('/author/novels/create');
  await page.fill('[data-testid="novel-title-input"]', title);
  await page.fill('[data-testid="novel-summary-input"]', '测试简介');
  await page.selectOption('[data-testid="novel-category-select"]', '仙侠');
  await page.click('[data-testid="save-draft-button"]');
  await page.waitForURL('/author/novels');
  
  // 返回小说ID
  const novelLink = await page.locator(`text=${title}`).getAttribute('href');
  return novelLink.split('/').pop();
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(page: Page): Promise<void> {
  // 清理创建的小说
  await page.goto('/author/novels');
  const deleteButtons = await page.locator('[data-testid="delete-novel-btn"]').all();
  for (const btn of deleteButtons) {
    if (await btn.isVisible()) {
      await btn.click();
      await page.click('[data-testid="confirm-delete"]');
      await page.waitForTimeout(500);
    }
  }
}

/**
 * 等待Toast消失
 */
export async function waitForToast(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="toast"]', { state: 'visible' });
  await page.waitForSelector('[data-testid="toast"]', { state: 'hidden' });
}
```

---

## 8. 测试配置

```typescript
// tests/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
