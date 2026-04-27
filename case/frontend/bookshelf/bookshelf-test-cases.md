# 书架模块测试用例

## 1. 需求理解

### 1.1 功能概述
书架模块允许读者管理自己的阅读列表，包括添加小说、更新阅读进度、标记阅读状态等功能。

### 1.2 涉及页面
- 书架页面: `/bookshelf`
- API端点: `/api/v1/bookshelf`

### 1.3 关键功能点
1. 查看书架列表
2. 添加小说到书架
3. 更新阅读进度
4. 标记阅读状态（未读/在读/已读）
5. 从书架移除
6. 查看阅读历史

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 完整书架管理流程
- **集成测试**: API数据持久化验证
- **权限测试**: 仅登录用户可访问
- **边界测试**: 空书架、大量数据

### 2.2 优先级
- P0: 书架查看、添加、移除
- P1: 进度更新、状态标记
- P2: 阅读历史、排序筛选

---

## 3. 测试用例

### 3.1 书架列表

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| SHELF-001 | US-SHELF-001-权限检查 | 未登录用户被重定向 | E2E | 前端服务已启动 | 1. 清除登录状态<br>2. 访问 `/bookshelf` | 重定向到 `/login` | P0 |
| SHELF-002 | US-SHELF-002-书架加载 | 已登录用户查看书架 | E2E | 用户已登录 | 1. 访问 `/bookshelf` | 1. 显示书架列表<br>2. 显示小说封面、标题 | P0 |
| SHELF-003 | US-SHELF-003-空书架 | 空书架状态显示 | E2E | 用户已登录<br>书架为空 | 1. 访问 `/bookshelf` | 显示"书架空空如也"提示 | P1 |
| SHELF-004 | US-SHELF-004-阅读进度 | 显示阅读进度 | E2E | 书架有小说 | 1. 查看书架列表 | 显示进度条和百分比 | P1 |
| SHELF-005 | US-SHELF-005-阅读状态 | 显示阅读状态标签 | E2E | 书架有小说 | 1. 查看书架列表 | 显示"未读"/"在读"/"已读"标签 | P1 |

### 3.2 添加和移除

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| SHELF-006 | US-SHELF-006-添加小说 | 从小说详情页添加 | E2E | 用户已登录 | 1. 访问小说详情<br>2. 点击"加入书架" | 1. 显示成功提示<br>2. 书架中显示该小说 | P0 |
| SHELF-007 | US-SHELF-007-重复添加 | 重复添加同一小说 | E2E | 同 SHELF-006 | 1. 再次点击"加入书架" | 显示"已在书架中"提示 | P1 |
| SHELF-008 | US-SHELF-008-移除小说 | 从书架移除 | E2E | 书架有小说 | 1. 点击移除按钮<br>2. 确认移除 | 1. 小说从书架消失<br>2. 显示成功提示 | P0 |

### 3.3 进度和状态管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| SHELF-009 | US-SHELF-009-更新进度 | 更新阅读进度 | E2E | 书架有小说 | 1. 点击进度条<br>2. 设置新进度 | 进度更新成功 | P1 |
| SHELF-010 | US-SHELF-010-标记在读 | 标记为在读状态 | E2E | 书架有小说 | 1. 选择"在读"状态 | 状态更新为"在读" | P1 |
| SHELF-011 | US-SHELF-011-标记已读 | 标记为已读状态 | E2E | 书架有小说 | 1. 选择"已读"状态 | 状态更新为"已读" | P1 |
| SHELF-012 | US-SHELF-012-阅读历史 | 查看阅读历史 | E2E | 用户已登录 | 1. 访问阅读历史 | 显示最近阅读记录 | P2 |

### 3.4 响应式布局

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| SHELF-013 | US-SHELF-013-桌面端 | 桌面端布局 | 响应式 | 同 SHELF-002 | 1. 设置视口1280px | 列表布局正常 | P1 |
| SHELF-014 | US-SHELF-014-移动端 | 移动端布局 | 响应式 | 同 SHELF-002 | 1. 设置视口375px | 卡片堆叠显示 | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/bookshelf/bookshelf.spec.ts

import { test, expect } from '@playwright/test';

test.describe('书架模块', () => {
  test.describe('权限控制', () => {
    test('SHELF-001: 未登录用户被重定向', async ({ page }) => {
      await page.goto('/bookshelf');
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('书架功能', () => {
    test.beforeEach(async ({ page }) => {
      // 登录测试用户
      await page.goto('/login');
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('Test1234');
      await page.getByRole('button', { name: '登录' }).click();
      await page.waitForURL('/');
    });

    test('SHELF-002: 已登录用户查看书架', async ({ page }) => {
      await page.goto('/bookshelf');
      await expect(page.getByRole('heading', { name: '我的书架' })).toBeVisible();
    });

    test('SHELF-006: 从小说详情页添加', async ({ page }) => {
      await page.goto('/novels');
      await page.locator('.novel-card').first().click();
      await page.getByRole('button', { name: '加入书架' }).click();
      await expect(page.getByText('已加入书架')).toBeVisible();
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 确保有测试用户数据
npm run db:seed
```

### 5.2 运行测试
```bash
cd apps/frontend
npx playwright test case/coding/bookshelf/bookshelf.spec.ts
```
