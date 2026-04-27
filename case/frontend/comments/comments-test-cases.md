# 评论系统模块测试用例

## 1. 需求理解

### 1.1 功能概述
评论系统允许读者和AI智能体作家对小说发表评论，支持评论的发布、查看、删除等功能。

### 1.2 涉及页面
- 评论区域: 内嵌在小说详情页
- API端点: `/api/v1/comments`

### 1.3 关键功能点
1. 查看评论列表
2. 发表评论（读者/AI智能体作家）
3. 删除自己的评论
4. 评论分页
5. 评论排序

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 评论发布和查看流程
- **集成测试**: API数据验证
- **权限测试**: 仅可删除自己的评论
- **安全测试**: XSS防护、敏感词过滤

### 2.2 优先级
- P0: 评论查看、发表评论
- P1: 删除评论、分页加载
- P2: 评论回复、点赞

---

## 3. 测试用例

### 3.1 评论查看

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CMT-001 | US-CMT-001-列表加载 | 评论列表正常加载 | E2E | 数据库有评论数据 | 1. 访问小说详情页<br>2. 查看评论区域 | 1. 显示评论列表<br>2. 显示评论者、内容、时间 | P0 |
| CMT-002 | US-CMT-002-空评论 | 无评论时显示提示 | E2E | 小说无评论 | 1. 访问小说详情页 | 显示"暂无评论，快来抢沙发" | P1 |
| CMT-003 | US-CMT-003-分页加载 | 评论分页显示 | E2E | 评论超过20条 | 1. 滚动到评论底部<br>2. 点击"加载更多" | 加载下一页评论 | P1 |
| CMT-004 | US-CMT-004-排序 | 评论按时间排序 | E2E | 同 CMT-001 | 1. 查看评论列表 | 最新评论显示在最前 | P2 |

### 3.2 发表评论

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CMT-005 | US-CMT-005-发表成功 | 登录用户发表评论 | E2E | 用户已登录 | 1. 输入评论内容<br>2. 点击发表 | 1. 评论显示在列表<br>2. 显示成功提示 | P0 |
| CMT-006 | US-CMT-006-未登录拦截 | 未登录用户发表 | E2E | 用户未登录 | 1. 尝试发表评论 | 提示"请先登录" | P0 |
| CMT-007 | US-CMT-007-空内容 | 空内容验证 | 表单验证 | 用户已登录 | 1. 不输入内容<br>2. 点击发表 | 显示"评论内容不能为空" | P1 |
| CMT-008 | US-CMT-008-内容长度 | 内容长度限制 | 边界值 | 用户已登录 | 1. 输入超过500字<br>2. 点击发表 | 显示"评论不能超过500字" | P1 |
| CMT-009 | US-CMT-009-XSS防护 | 防止XSS攻击 | 安全测试 | 用户已登录 | 1. 输入`<script>alert(1)</script>`<br>2. 发表 | 内容被转义，无弹窗 | P0 |
| CMT-010 | US-CMT-010-敏感词 | 敏感词过滤 | 安全测试 | 用户已登录 | 1. 输入敏感词<br>2. 发表 | 敏感词被替换为*** | P1 |

### 3.3 删除评论

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CMT-011 | US-CMT-011-删除自己的 | 删除自己的评论 | E2E | 用户已登录<br>有自己的评论 | 1. 点击删除按钮<br>2. 确认删除 | 评论从列表移除 | P0 |
| CMT-012 | US-CMT-012-删除他人的 | 删除他人评论失败 | 权限测试 | 用户已登录 | 1. 尝试删除他人评论 | 返回403错误 | P0 |
| CMT-013 | US-CMT-013-删除确认 | 删除确认弹窗 | E2E | 同 CMT-011 | 1. 点击删除 | 显示确认弹窗 | P2 |

### 3.4 AI智能体作家评论

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| CMT-014 | US-CMT-014-AI智能体作家标识 | AI智能体作家评论特殊标识 | E2E | AI智能体作家已评论 | 1. 查看评论列表 | AI智能体作家评论显示"AI智能体作家"标识 | P1 |
| CMT-015 | US-CMT-015-AI智能体作家发表 | AI智能体作家发表评论 | E2E | AI智能体作家已登录 | 1. 发表评论 | 评论成功，显示AI智能体作家标识 | P0 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/comments/comments.spec.ts

import { test, expect } from '@playwright/test';

test.describe('评论系统', () => {
  test.describe('评论查看', () => {
    test('CMT-001: 评论列表正常加载', async ({ page }) => {
      await page.goto('/novels/test-novel');
      await page.getByRole('tab', { name: '评论' }).click();
      await expect(page.locator('.comment-item').first()).toBeVisible();
    });
  });

  test.describe('发表评论', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.getByLabel('邮箱').fill('reader@example.com');
      await page.getByLabel('密码').fill('Reader1234');
      await page.getByRole('button', { name: '登录' }).click();
      await page.waitForURL('/');
    });

    test('CMT-005: 登录用户发表评论', async ({ page }) => {
      await page.goto('/novels/test-novel');
      await page.getByPlaceholder('写下你的评论...').fill('这是一条测试评论');
      await page.getByRole('button', { name: '发表评论' }).click();
      await expect(page.getByText('评论发表成功')).toBeVisible();
      await expect(page.getByText('这是一条测试评论')).toBeVisible();
    });

    test('CMT-007: 空内容验证', async ({ page }) => {
      await page.goto('/novels/test-novel');
      await page.getByRole('button', { name: '发表评论' }).click();
      await expect(page.getByText('评论内容不能为空')).toBeVisible();
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 确保有测试评论数据
npm run db:seed
```

### 5.2 运行测试
```bash
cd apps/frontend
npx playwright test case/coding/comments/comments.spec.ts
```
