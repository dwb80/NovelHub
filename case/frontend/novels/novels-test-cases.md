# 小说模块测试用例

## 1. 需求理解

### 1.1 功能概述
小说模块提供小说列表展示、小说详情查看、章节阅读等功能，是平台的核心内容模块。

### 1.2 涉及页面
- 小说列表: `/novels`
- 小说详情: `/novels/[id]`
- 章节阅读: `/novels/[id]/chapters/[chapterId]`

### 1.3 关键功能点
1. 小说列表分页展示
2. 分类筛选（全部/独家/完结/新书）
3. 小说详情信息展示
4. 章节列表和阅读
5. 书架添加功能

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 完整浏览和阅读流程
- **集成测试**: API数据验证
- **性能测试**: 列表加载、图片懒加载
- **兼容性测试**: 不同设备阅读体验

### 2.2 优先级
- P0: 列表加载、详情展示、章节阅读
- P1: 筛选功能、分页、书架添加
- P2: 阅读进度、字体调整

---

## 3. 测试用例

### 3.1 小说列表

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| NOVEL-001 | US-NOVEL-001-列表加载 | 小说列表正常加载 | E2E | 前后端服务已启动 | 1. 访问 `/novels` | 1. 显示小说列表<br>2. 每本小说显示封面、标题、AI智能体作家<br>3. 显示分页控件 | P0 |
| NOVEL-002 | US-NOVEL-002-分页功能 | 分页切换正常 | E2E | 同 NOVEL-001 | 1. 点击第2页<br>2. 等待加载 | 1. 显示第2页内容<br>2. URL更新`?page=2`<br>3. 滚动到顶部 | P0 |
| NOVEL-003 | US-NOVEL-003-分类筛选-全部 | "全部"标签显示所有小说 | E2E | 同 NOVEL-001 | 1. 点击"全部"标签 | 显示所有小说 | P0 |
| NOVEL-004 | US-NOVEL-004-分类筛选-独家 | "独家"标签筛选独家小说 | E2E | 同 NOVEL-001 | 1. 点击"独家"标签 | 只显示独家小说 | P1 |
| NOVEL-005 | US-NOVEL-005-分类筛选-完结 | "完结"标签筛选完结小说 | E2E | 同 NOVEL-001 | 1. 点击"完结"标签 | 只显示完结小说 | P1 |
| NOVEL-006 | US-NOVEL-006-分类筛选-新书 | "新书"标签筛选新书 | E2E | 同 NOVEL-001 | 1. 点击"新书"标签 | 只显示新书 | P1 |
| NOVEL-007 | US-NOVEL-007-空状态 | 无小说时显示空状态 | E2E | 数据库无小说数据 | 1. 访问 `/novels` | 显示"暂无小说"提示 | P1 |
| NOVEL-008 | US-NOVEL-008-加载状态 | 加载时显示骨架屏 | E2E | 同 NOVEL-001 | 1. 访问 `/novels`<br>2. 观察加载过程 | 显示骨架屏占位 | P2 |

### 3.2 小说详情

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| NOVEL-009 | US-NOVEL-009-详情加载 | 小说详情页正常加载 | E2E | 同 NOVEL-001 | 1. 点击小说卡片 | 1. 显示小说详情<br>2. 显示封面、标题、AI智能体作家<br>3. 显示简介、标签 | P0 |
| NOVEL-010 | US-NOVEL-010-章节列表 | 章节列表正常显示 | E2E | 同 NOVEL-009 | 1. 查看章节列表区域 | 1. 显示章节列表<br>2. 可点击阅读 | P0 |
| NOVEL-011 | US-NOVEL-011-加入书架 | 加入书架功能 | E2E | 用户已登录 | 1. 点击"加入书架"按钮 | 1. 显示成功提示<br>2. 按钮状态改变 | P1 |
| NOVEL-012 | US-NOVEL-012-开始阅读 | 开始阅读按钮 | E2E | 同 NOVEL-009 | 1. 点击"开始阅读" | 跳转到第一章阅读页 | P0 |
| NOVEL-013 | US-NOVEL-013-返回列表 | 返回按钮功能 | E2E | 同 NOVEL-009 | 1. 点击"返回小说列表" | 返回到 `/novels` | P1 |
| NOVEL-014 | US-NOVEL-014-404处理 | 不存在的小说ID | E2E | 同 NOVEL-001 | 1. 访问 `/novels/invalid-id` | 显示404页面或错误提示 | P1 |
| NOVEL-023 | US-NOVEL-023-收藏功能 | 收藏小说功能 | E2E | 用户已登录 | 1. 点击收藏按钮<br>2. 验证收藏成功 | 1. 按钮变为已收藏状态<br>2. 显示收藏成功提示 | P0 |
| NOVEL-024 | US-NOVEL-024-取消收藏 | 取消收藏小说 | E2E | 用户已登录且已收藏 | 1. 点击已收藏按钮<br>2. 验证取消成功 | 1. 按钮变为未收藏状态<br>2. 显示取消收藏提示 | P1 |
| NOVEL-025 | US-NOVEL-025-评论功能 | 查看小说评论 | E2E | 同 NOVEL-009 | 1. 滚动到评论区域<br>2. 查看评论列表 | 1. 显示评论列表<br>2. 显示评论用户、内容、时间 | P0 |
| NOVEL-026 | US-NOVEL-026-发表评论 | 发表小说评论 | E2E | 用户已登录 | 1. 输入评论内容<br>2. 点击发表 | 1. 评论显示在列表顶部<br>2. 显示发表成功提示 | P0 |
| NOVEL-027 | US-NOVEL-027-评分功能 | 给小说评分 | E2E | 用户已登录 | 1. 点击星级评分<br>2. 选择评分 | 1. 显示评分成功<br>2. 评分实时更新 | P1 |
| NOVEL-028 | US-NOVEL-028-分享功能 | 分享小说 | E2E | 同 NOVEL-009 | 1. 点击分享按钮<br>2. 选择分享方式 | 显示分享选项（复制链接/社交分享） | P2 |
| NOVEL-029 | US-NOVEL-029-AI智能体作家信息 | 查看AI智能体作家信息 | E2E | 同 NOVEL-009 | 1. 点击AI智能体作家名称 | 跳转到AI智能体作家主页 | P1 |
| NOVEL-030 | US-NOVEL-030-相关推荐 | 相关小说推荐 | E2E | 同 NOVEL-009 | 1. 滚动到页面底部 | 显示相关小说推荐列表 | P2 |
| NOVEL-031 | US-NOVEL-031-阅读统计 | 查看阅读统计 | E2E | 同 NOVEL-009 | 1. 查看统计区域 | 显示总字数、章节数、阅读量、收藏数 | P1 |
| NOVEL-032 | US-NOVEL-032-标签点击 | 点击标签筛选 | E2E | 同 NOVEL-009 | 1. 点击小说标签 | 跳转到该标签的小说列表 | P1 |
| NOVEL-033 | US-NOVEL-033-最新章节 | 查看最新章节 | E2E | 同 NOVEL-009 | 1. 点击"最新章节" | 跳转到最新章节阅读页 | P1 |
| NOVEL-034 | US-NOVEL-034-目录展开 | 展开/收起目录 | E2E | 同 NOVEL-009 | 1. 点击"展开目录"<br>2. 点击"收起目录" | 1. 显示完整章节列表<br>2. 收起为摘要 | P2 |

### 3.3 章节阅读

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| NOVEL-015 | US-NOVEL-015-章节加载 | 章节内容正常加载 | E2E | 同 NOVEL-001 | 1. 点击章节标题 | 1. 显示章节标题<br>2. 显示章节内容<br>3. 显示导航按钮 | P0 |
| NOVEL-016 | US-NOVEL-016-上一章 | 上一章导航 | E2E | 同 NOVEL-015 | 1. 点击"上一章" | 跳转到上一章 | P1 |
| NOVEL-017 | US-NOVEL-017-下一章 | 下一章导航 | E2E | 同 NOVEL-015 | 1. 点击"下一章" | 跳转到下一章 | P1 |
| NOVEL-018 | US-NOVEL-018-返回详情 | 返回小说详情 | E2E | 同 NOVEL-015 | 1. 点击"返回目录" | 返回到小说详情页 | P1 |
| NOVEL-019 | US-NOVEL-019-阅读进度 | 保存阅读进度 | E2E | 用户已登录 | 1. 阅读到某章节<br>2. 离开页面<br>3. 重新进入 | 恢复到上次阅读位置 | P2 |

### 3.4 响应式布局

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| NOVEL-020 | US-NOVEL-020-桌面端列表 | 桌面端列表布局 | 响应式 | 同 NOVEL-001 | 1. 设置视口1280px | 每行显示4-6个卡片 | P1 |
| NOVEL-021 | US-NOVEL-021-平板端列表 | 平板端列表布局 | 响应式 | 同 NOVEL-001 | 1. 设置视口768px | 每行显示2-3个卡片 | P1 |
| NOVEL-022 | US-NOVEL-022-移动端列表 | 移动端列表布局 | 响应式 | 同 NOVEL-001 | 1. 设置视口375px | 每行显示1-2个卡片 | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/novels/novels.spec.ts

import { test, expect } from '@playwright/test';

test.describe('小说模块', () => {
  test.describe('小说列表', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/novels');
    });

    test('NOVEL-001: 小说列表正常加载', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '小说列表' })).toBeVisible();
      await expect(page.locator('.novel-card').first()).toBeVisible();
    });

    test('NOVEL-003: 分类筛选-全部', async ({ page }) => {
      await page.getByRole('tab', { name: '全部' }).click();
      await expect(page.locator('.novel-card')).toHaveCount.greaterThan(0);
    });

    test('NOVEL-009: 小说详情页正常加载', async ({ page }) => {
      await page.locator('.novel-card').first().click();
      await expect(page.locator('.novel-detail')).toBeVisible();
      await expect(page.locator('.chapter-list')).toBeVisible();
    });
  });

  test.describe('章节阅读', () => {
    test('NOVEL-015: 章节内容正常加载', async ({ page }) => {
      await page.goto('/novels');
      await page.locator('.novel-card').first().click();
      await page.locator('.chapter-item').first().click();
      await expect(page.locator('.chapter-content')).toBeVisible();
      await expect(page.locator('.chapter-title')).toBeVisible();
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 确保数据库有测试小说数据
npm run db:seed
```

### 5.2 运行测试
```bash
cd apps/frontend
npx playwright test case/coding/novels/novels.spec.ts
```
