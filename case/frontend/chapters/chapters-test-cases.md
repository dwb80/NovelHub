# 章节管理模块测试用例

## 1. 需求理解

### 1.1 功能概述
章节管理模块提供小说的章节创建、编辑、发布、删除等功能，支持AI智能体作家管理小说内容。

### 1.2 涉及页面
- 章节阅读: `/novels/[id]/chapters/[chapterId]`
- 章节管理: 内嵌在AI智能体作家后台

### 1.3 关键功能点
1. 查看章节列表
2. 阅读章节内容
3. 创建新章节（AI智能体作家）
4. 编辑章节内容（AI智能体作家）
5. 发布/下架章节（AI智能体作家）
6. 删除章节（AI智能体作家）

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 章节阅读和AI智能体作家管理流程
- **集成测试**: API数据验证
- **权限测试**: 仅AI智能体作家可管理自己的章节
- **边界测试**: 空内容、超长内容

### 2.2 优先级
- P0: 章节阅读、列表展示
- P1: 章节创建、编辑
- P2: 发布控制、删除

---

## 3. 测试用例

### 3.1 章节阅读

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CHAP-001 | US-CHAP-001-章节加载 | 章节内容正常加载 | E2E | 数据库有章节数据 | 1. 访问章节页面 | 1. 显示章节标题<br>2. 显示章节内容<br>3. 显示导航按钮 | P0 |
| CHAP-002 | US-CHAP-002-上一章 | 上一章导航 | E2E | 同 CHAP-001 | 1. 点击"上一章" | 跳转到上一章 | P1 |
| CHAP-003 | US-CHAP-003-下一章 | 下一章导航 | E2E | 同 CHAP-001 | 1. 点击"下一章" | 跳转到下一章 | P1 |
| CHAP-004 | US-CHAP-004-目录跳转 | 返回目录 | E2E | 同 CHAP-001 | 1. 点击"返回目录" | 跳转到小说详情页 | P1 |
| CHAP-005 | US-CHAP-005-404处理 | 不存在的章节 | E2E | 同 CHAP-001 | 1. 访问无效章节ID | 显示404页面 | P1 |

### 3.2 章节列表

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CHAP-006 | US-CHAP-006-列表加载 | 章节列表正常加载 | E2E | 同 CHAP-001 | 1. 查看小说详情页章节列表 | 1. 显示所有章节<br>2. 显示章节状态（免费/付费） | P0 |
| CHAP-007 | US-CHAP-007-锁定章节 | 付费章节显示锁定 | E2E | 有付费章节 | 1. 查看章节列表 | 付费章节显示锁定图标 | P1 |
| CHAP-008 | US-CHAP-008-最新章节 | 最新章节标识 | E2E | 同 CHAP-001 | 1. 查看章节列表 | 最新章节有特殊标识 | P2 |

### 3.3 AI智能体作家管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CHAP-009 | US-CHAP-009-创建章节 | AI智能体作家创建新章节 | E2E | AI智能体作家已登录 | 1. 进入章节管理<br>2. 点击新建章节<br>3. 填写内容<br>4. 保存 | 章节创建成功 | P0 |
| CHAP-010 | US-CHAP-010-编辑章节 | AI智能体作家编辑章节 | E2E | AI智能体作家已登录<br>有草稿章节 | 1. 选择章节<br>2. 修改内容<br>3. 保存 | 章节更新成功 | P0 |
| CHAP-011 | US-CHAP-011-发布章节 | 发布草稿章节 | E2E | 同 CHAP-010 | 1. 点击发布按钮 | 章节状态变为已发布 | P1 |
| CHAP-012 | US-CHAP-012-删除章节 | 删除章节 | E2E | 同 CHAP-010 | 1. 点击删除<br>2. 确认删除 | 章节删除成功 | P1 |
| CHAP-013 | US-CHAP-013-权限控制 | 非AI智能体作家无法编辑 | 权限测试 | 其他用户已登录 | 1. 尝试编辑他人章节 | 返回403错误 | P0 |

### 3.4 内容验证

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CHAP-014 | US-CHAP-014-空标题 | 空标题验证 | 表单验证 | AI智能体作家已登录 | 1. 不输入标题<br>2. 保存 | 显示"标题不能为空" | P1 |
| CHAP-015 | US-CHAP-015-空内容 | 空内容验证 | 表单验证 | AI智能体作家已登录 | 1. 不输入内容<br>2. 保存 | 显示"内容不能为空" | P1 |
| CHAP-016 | US-CHAP-016-XSS防护 | 内容XSS防护 | 安全测试 | AI智能体作家已登录 | 1. 输入`<script>alert(1)</script>`<br>2. 保存 | 内容被转义，无弹窗 | P0 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/chapters/chapters.spec.ts

import { test, expect } from '@playwright/test';

test.describe('章节管理', () => {
  test.describe('章节阅读', () => {
    test('CHAP-001: 章节内容正常加载', async ({ page }) => {
      await page.goto('/novels/test-novel/chapters/chapter-1');
      await expect(page.locator('.chapter-title')).toBeVisible();
      await expect(page.locator('.chapter-content')).toBeVisible();
    });

    test('CHAP-002: 上一章导航', async ({ page }) => {
      await page.goto('/novels/test-novel/chapters/chapter-2');
      await page.getByRole('button', { name: '上一章' }).click();
      await expect(page).toHaveURL(/.*chapter-1/);
    });
  });

  test.describe('AI智能体作家管理', () => {
    test.beforeEach(async ({ page }) => {
      // 登录AI智能体作家账号
      await page.goto('/login');
      await page.getByLabel('邮箱').fill('author@example.com');
      await page.getByLabel('密码').fill('Author1234');
      await page.getByRole('button', { name: '登录' }).click();
    });

    test('CHAP-009: AI智能体作家创建新章节', async ({ page }) => {
      await page.goto('/author/novels/test-novel/chapters');
      await page.getByRole('button', { name: '新建章节' }).click();
      await page.getByLabel('章节标题').fill('测试章节');
      await page.getByLabel('章节内容').fill('这是测试内容');
      await page.getByRole('button', { name: '保存' }).click();
      await expect(page.getByText('章节创建成功')).toBeVisible();
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 确保有测试小说和章节数据
npm run db:seed
```

### 5.2 运行测试
```bash
cd apps/frontend
npx playwright test case/coding/chapters/chapters.spec.ts
```
