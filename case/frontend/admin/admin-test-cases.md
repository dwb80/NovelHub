# 管理后台模块测试用例

## 1. 需求理解

### 1.1 功能概述
管理后台提供系统管理功能，包括管理员登录、数据统计、内容审核、用户管理等。

### 1.2 涉及页面
- 管理员登录: `/admin/login`
- 管理仪表盘: `/admin/dashboard`

### 1.3 关键功能点
1. 管理员登录
2. 数据统计查看
3. 小说审核
4. 用户管理
5. 系统设置

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 管理员操作流程
- **集成测试**: API数据验证
- **权限测试**: 仅管理员可访问
- **安全测试**: 登录保护、越权访问

### 2.2 优先级
- P0: 管理员登录、仪表盘查看
- P1: 数据统计、内容审核
- P2: 用户管理、系统设置

---

## 3. 测试用例

### 3.1 管理员登录

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-001 | US-ADMIN-001-登录页面 | 登录页面正常加载 | E2E | 服务已启动 | 1. 访问 `/admin/login` | 显示管理员登录表单 | P0 |
| ADMIN-002 | US-ADMIN-002-成功登录 | 使用有效凭证登录 | E2E | 同 ADMIN-001 | 1. 输入账号密码<br>2. 点击登录 | 1. 登录成功<br>2. 跳转到仪表盘 | P0 |
| ADMIN-003 | US-ADMIN-003-错误密码 | 密码错误处理 | E2E | 同 ADMIN-001 | 1. 输入错误密码<br>2. 点击登录 | 显示"账号或密码错误" | P0 |
| ADMIN-004 | US-ADMIN-004-账号锁定 | 账号锁定处理 | E2E | 账号已被锁定 | 1. 尝试登录 | 显示"账号已锁定" | P1 |
| ADMIN-005 | US-ADMIN-005-读者拦截 | 读者无法登录 | 权限测试 | 读者账号 | 1. 使用读者账号尝试登录 | 登录失败 | P0 |

### 3.2 仪表盘

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-006 | US-ADMIN-006-仪表盘加载 | 仪表盘正常加载 | E2E | 管理员已登录 | 1. 访问 `/admin/dashboard` | 1. 显示统计卡片<br>2. 显示图表 | P0 |
| ADMIN-007 | US-ADMIN-007-数据统计 | 统计数据正确 | E2E | 同 ADMIN-006 | 1. 查看统计区域 | 显示用户数、小说数、章节数等 | P0 |
| ADMIN-008 | US-ADMIN-008-权限检查 | 未登录访问被拦截 | 权限测试 | 未登录 | 1. 访问 `/admin/dashboard` | 重定向到登录页 | P0 |
| ADMIN-009 | US-ADMIN-009-读者拦截 | 读者无法访问 | 权限测试 | 读者已登录 | 1. 访问 `/admin/dashboard` | 返回403错误 | P0 |

### 3.3 内容审核

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-010 | US-ADMIN-010-待审核列表 | 待审核内容列表 | E2E | 管理员已登录 | 1. 进入审核页面 | 显示待审核小说/章节列表 | P1 |
| ADMIN-011 | US-ADMIN-011-通过审核 | 通过审核 | E2E | 有待审核内容 | 1. 点击通过按钮 | 内容状态变为已发布 | P1 |
| ADMIN-012 | US-ADMIN-012-拒绝审核 | 拒绝审核 | E2E | 有待审核内容 | 1. 点击拒绝按钮<br>2. 填写原因 | 内容被拒绝，显示原因 | P1 |

### 3.4 用户管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| ADMIN-013 | US-ADMIN-013-用户列表 | 查看用户列表 | E2E | 管理员已登录 | 1. 进入用户管理 | 显示用户列表 | P2 |
| ADMIN-014 | US-ADMIN-014-禁用用户 | 禁用用户账号 | E2E | 同 ADMIN-013 | 1. 选择用户<br>2. 点击禁用 | 用户状态变为禁用 | P2 |
| ADMIN-015 | US-ADMIN-015-启用用户 | 启用用户账号 | E2E | 有禁用用户 | 1. 选择用户<br>2. 点击启用 | 用户状态变为正常 | P2 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/admin/admin.spec.ts

import { test, expect } from '@playwright/test';

test.describe('管理后台', () => {
  test.describe('管理员登录', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin/login');
    });

    test('ADMIN-001: 登录页面正常加载', async ({ page }) => {
      await expect(page).toHaveTitle(/管理员登录/);
      await expect(page.getByRole('heading', { name: '管理员登录' })).toBeVisible();
    });

    test('ADMIN-003: 密码错误处理', async ({ page }) => {
      await page.getByLabel('账号').fill('admin');
      await page.getByLabel('密码').fill('wrongpassword');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('账号或密码错误')).toBeVisible();
    });
  });

  test.describe('仪表盘', () => {
    test.beforeEach(async ({ page }) => {
      // 登录管理员
      await page.goto('/admin/login');
      await page.getByLabel('账号').fill('admin');
      await page.getByLabel('密码').fill('Admin1234');
      await page.getByRole('button', { name: '登录' }).click();
      await page.waitForURL('/admin/dashboard');
    });

    test('ADMIN-006: 仪表盘正常加载', async ({ page }) => {
      await expect(page.getByRole('heading', { name: '管理仪表盘' })).toBeVisible();
      await expect(page.locator('.stat-card')).toHaveCount.greaterThan(0);
    });
  });

  test.describe('权限控制', () => {
    test('ADMIN-008: 未登录访问被拦截', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/.*admin\/login/);
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 确保有管理员账号
# 默认管理员账号: admin / Admin1234
npm run db:seed
```

### 5.2 运行测试
```bash
cd apps/frontend
npx playwright test case/coding/admin/admin.spec.ts
```
