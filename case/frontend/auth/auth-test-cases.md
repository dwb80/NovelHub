# 认证模块测试用例

## 1. 需求理解

### 1.1 功能概述
认证模块提供用户注册、登录、Token刷新等功能，支持读者和AI智能体作家两种角色。

### 1.2 涉及页面
- 注册页面: `/register`
- 登录页面: `/login`
- API端点: `/api/v1/auth`

### 1.3 关键功能点
1. 读者注册（邮箱+密码）
2. 读者/作家登录
3. Token刷新机制
4. 表单验证
5. 错误处理

---

## 2. 测试策略

### 2.1 测试类型
- **E2E测试**: 完整注册/登录流程
- **集成测试**: API接口验证
- **安全测试**: 密码强度、XSS防护
- **边界测试**: 输入长度、特殊字符

### 2.2 优先级
- P0: 注册、登录核心流程
- P1: 表单验证、Token刷新
- P2: 错误提示、UI交互

---

## 3. 测试用例

### 3.1 注册功能

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AUTH-001 | US-AUTH-001-注册页面 | 注册页面正常加载 | E2E | 前端服务已启动 | 1. 访问 `/register` | 1. 显示"读者注册"标题<br>2. 显示表单字段<br>3. 显示AI智能体作家提示 | P0 |
| AUTH-002 | US-AUTH-002-成功注册 | 使用有效信息注册成功 | E2E | 前端服务已启动<br>后端服务已启动 | 1. 访问 `/register`<br>2. 输入读者名称"testuser"<br>3. 输入邮箱"test@example.com"<br>4. 输入密码"Test1234"<br>5. 确认密码"Test1234"<br>6. 点击注册 | 1. 显示注册成功提示<br>2. 自动登录<br>3. 跳转到首页 | P0 |
| AUTH-003 | US-AUTH-003-名称验证 | 读者名称长度验证 | 表单验证 | 同 AUTH-001 | 1. 输入名称"ab"<br>2. 失去焦点 | 显示错误"读者名称至少需要3个字符" | P1 |
| AUTH-004 | US-AUTH-004-名称格式 | 读者名称格式验证 | 表单验证 | 同 AUTH-001 | 1. 输入名称"test@user"<br>2. 失去焦点 | 显示错误"读者名称只能包含字母、数字和下划线" | P1 |
| AUTH-005 | US-AUTH-005-邮箱验证 | 邮箱格式验证 | 表单验证 | 同 AUTH-001 | 1. 输入邮箱"invalid-email"<br>2. 失去焦点 | 显示错误"请输入有效的邮箱地址" | P1 |
| AUTH-006 | US-AUTH-006-密码强度 | 密码强度验证 | 表单验证 | 同 AUTH-001 | 1. 输入密码"12345678"<br>2. 失去焦点 | 显示错误"密码必须包含小写字母" | P1 |
| AUTH-007 | US-AUTH-007-密码确认 | 密码一致性验证 | 表单验证 | 同 AUTH-001 | 1. 输入密码"Test1234"<br>2. 输入确认密码"Test1235"<br>3. 失去焦点 | 显示错误"两次输入的密码不一致" | P1 |
| AUTH-008 | US-AUTH-008-重复注册 | 邮箱已存在验证 | 集成测试 | 同 AUTH-002 | 1. 使用已注册邮箱尝试注册 | 显示错误"邮箱已存在" | P0 |
| AUTH-009 | US-AUTH-009-XSS防护 | 防止XSS攻击 | 安全测试 | 同 AUTH-001 | 1. 输入名称`<script>alert(1)</script>`<br>2. 提交 | 1. 名称被转义<br>2. 无弹窗 | P0 |

### 3.2 登录功能

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AUTH-010 | US-AUTH-010-登录页面 | 登录页面正常加载 | E2E | 前端服务已启动 | 1. 访问 `/login` | 1. 显示"读者登录"标题<br>2. 显示邮箱、密码输入框 | P0 |
| AUTH-011 | US-AUTH-011-成功登录 | 使用有效凭证登录 | E2E | 同 AUTH-002 | 1. 访问 `/login`<br>2. 输入邮箱"test@example.com"<br>3. 输入密码"Test1234"<br>4. 点击登录 | 1. 显示登录成功<br>2. 保存Token<br>3. 跳转到首页 | P0 |
| AUTH-012 | US-AUTH-012-错误密码 | 密码错误处理 | E2E | 同 AUTH-002 | 1. 输入正确邮箱<br>2. 输入错误密码<br>3. 点击登录 | 显示错误"登录失败，请检查邮箱和密码" | P0 |
| AUTH-013 | US-AUTH-013-不存在用户 | 邮箱不存在处理 | E2E | 同 AUTH-002 | 1. 输入未注册邮箱<br>2. 输入任意密码<br>3. 点击登录 | 显示错误"登录失败，请检查邮箱和密码" | P0 |
| AUTH-014 | US-AUTH-014-空字段 | 空字段验证 | 表单验证 | 同 AUTH-001 | 1. 不输入任何字段<br>2. 点击登录 | 浏览器阻止提交（required属性） | P1 |

### 3.3 Token管理

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AUTH-015 | US-AUTH-015-Token刷新 | Token自动刷新 | 集成测试 | 用户已登录 | 1. 等待Token即将过期<br>2. 发起需要认证的请求 | 1. 自动调用刷新接口<br>2. 请求成功执行 | P1 |
| AUTH-016 | US-AUTH-016-Token过期 | Token过期处理 | 集成测试 | 用户已登录 | 1. 等待Token过期<br>2. 发起请求 | 1. 刷新失败<br>2. 跳转到登录页 | P1 |

### 3.4 导航链接

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AUTH-017 | US-AUTH-017-登录链接 | 注册页到登录页链接 | E2E | 同 AUTH-001 | 1. 访问 `/register`<br>2. 点击"立即登录" | 跳转到 `/login` | P1 |
| AUTH-018 | US-AUTH-018-注册链接 | 登录页到注册页链接 | E2E | 同 AUTH-010 | 1. 访问 `/login`<br>2. 点击"立即注册" | 跳转到 `/register` | P1 |
| AUTH-019 | US-AUTH-019-首页链接 | Logo返回首页 | E2E | 同 AUTH-001 | 1. 点击Logo | 跳转到 `/` | P1 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/auth/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('认证模块', () => {
  test.describe('注册功能', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('AUTH-001: 注册页面正常加载', async ({ page }) => {
      await expect(page).toHaveTitle(/注册/);
      await expect(page.getByRole('heading', { name: '读者注册' })).toBeVisible();
      await expect(page.getByLabel('读者名称')).toBeVisible();
      await expect(page.getByLabel('邮箱')).toBeVisible();
      await expect(page.getByLabel('密码')).toBeVisible();
    });

    test('AUTH-003: 读者名称长度验证', async ({ page }) => {
      await page.getByLabel('读者名称').fill('ab');
      await page.getByLabel('读者名称').blur();
      await expect(page.getByText('读者名称至少需要3个字符')).toBeVisible();
    });

    test('AUTH-005: 邮箱格式验证', async ({ page }) => {
      await page.getByLabel('邮箱').fill('invalid-email');
      await page.getByLabel('邮箱').blur();
      await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
    });
  });

  test.describe('登录功能', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('AUTH-010: 登录页面正常加载', async ({ page }) => {
      await expect(page).toHaveTitle(/登录/);
      await expect(page.getByRole('heading', { name: '读者登录' })).toBeVisible();
    });

    test('AUTH-012: 密码错误处理', async ({ page }) => {
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('wrongpassword');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('登录失败，请检查邮箱和密码')).toBeVisible();
    });

    test('AUTH-023: Token自动刷新', async ({ page }) => {
      // 登录获取token
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByLabel('密码').fill('password123');
      await page.getByRole('button', { name: '登录' }).click();
      await page.waitForURL('/');
      
      // 模拟token过期（通过localStorage修改）
      await page.evaluate(() => {
        const expiredToken = 'expired_token_simulation';
        localStorage.setItem('accessToken', expiredToken);
      });
      
      // 访问需要登录的页面，触发token刷新
      await page.goto('/bookshelf');
      
      // 验证页面正常加载（token刷新成功）
      await expect(page.getByText('我的书架')).toBeVisible();
    });
  });

  test.describe('密码重置功能', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password');
    });

    test('AUTH-024: 密码重置页面正常加载', async ({ page }) => {
      await expect(page).toHaveTitle(/重置密码/);
      await expect(page.getByRole('heading', { name: '重置密码' })).toBeVisible();
      await expect(page.getByLabel('邮箱')).toBeVisible();
      await expect(page.getByRole('button', { name: '发送重置链接' })).toBeVisible();
    });

    test('AUTH-025: 发送密码重置邮件成功', async ({ page }) => {
      await page.getByLabel('邮箱').fill('test@example.com');
      await page.getByRole('button', { name: '发送重置链接' }).click();
      await expect(page.getByText('重置链接已发送到您的邮箱')).toBeVisible();
    });

    test('AUTH-026: 邮箱不存在处理', async ({ page }) => {
      await page.getByLabel('邮箱').fill('nonexistent@example.com');
      await page.getByRole('button', { name: '发送重置链接' }).click();
      await expect(page.getByText('该邮箱未注册')).toBeVisible();
    });

    test('AUTH-027: 无效邮箱格式处理', async ({ page }) => {
      await page.getByLabel('邮箱').fill('invalid-email');
      await page.getByRole('button', { name: '发送重置链接' }).click();
      await expect(page.getByText('请输入有效的邮箱地址')).toBeVisible();
    });

    test('AUTH-028: 重置密码页面正常加载', async ({ page }) => {
      // 使用模拟的重置token访问重置页面
      await page.goto('/reset-password?token=mock-reset-token');
      await expect(page.getByRole('heading', { name: '设置新密码' })).toBeVisible();
      await expect(page.getByLabel('新密码')).toBeVisible();
      await expect(page.getByLabel('确认新密码')).toBeVisible();
      await expect(page.getByRole('button', { name: '重置密码' })).toBeVisible();
    });

    test('AUTH-029: 重置密码成功', async ({ page }) => {
      await page.goto('/reset-password?token=mock-reset-token');
      await page.getByLabel('新密码').fill('newpassword123');
      await page.getByLabel('确认新密码').fill('newpassword123');
      await page.getByRole('button', { name: '重置密码' }).click();
      await expect(page.getByText('密码重置成功，请使用新密码登录')).toBeVisible();
      await expect(page).toHaveURL('/login');
    });

    test('AUTH-030: 密码不一致处理', async ({ page }) => {
      await page.goto('/reset-password?token=mock-reset-token');
      await page.getByLabel('新密码').fill('newpassword123');
      await page.getByLabel('确认新密码').fill('differentpassword');
      await page.getByRole('button', { name: '重置密码' }).click();
      await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
    });

    test('AUTH-031: 无效重置令牌处理', async ({ page }) => {
      await page.goto('/reset-password?token=invalid-token');
      await page.getByLabel('新密码').fill('newpassword123');
      await page.getByLabel('确认新密码').fill('newpassword123');
      await page.getByRole('button', { name: '重置密码' }).click();
      await expect(page.getByText('重置链接已过期或无效')).toBeVisible();
    });
  });
});
```

---

## 5. 执行指南

### 5.1 环境准备
```bash
# 启动后端服务
cd apps/backend
npm run start:dev

# 启动前端服务
cd apps/frontend
npm run dev
```

### 5.2 运行测试
```bash
# 运行认证模块测试
cd apps/frontend
npx playwright test case/coding/auth/auth.spec.ts
```

### 5.3 测试数据
- 测试邮箱: `test@example.com`
- 测试密码: `Test1234`
- 测试名称: `testuser`
