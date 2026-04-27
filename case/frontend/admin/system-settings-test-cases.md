# 系统设置页测试用例文档

**最后更新**: 2026-04-19  
**对应页面**: http://localhost:3000/admin/settings  
**测试类型**: 功能测试、集成测试、E2E测试

---

## 1. 测试用例汇总表

| 用例ID | 对应需求 | 测试描述 | 测试类型 | 优先级 |
|--------|----------|----------|----------|--------|
| TC-SET-001 | SET-SITE-001 | 页面加载时正确显示数据库设置 | 集成测试 | P0 |
| TC-SET-002 | SET-SITE-001 | 修改网站名称并保存成功 | E2E测试 | P0 |
| TC-SET-003 | SET-SITE-001 | 切换维护模式开关并保存 | E2E测试 | P0 |
| TC-SET-004 | SET-SITE-001 | 关闭注册功能并验证生效 | E2E测试 | P1 |
| TC-SET-005 | SET-SITE-001 | 空网站名称验证 | 功能测试 | P1 |
| TC-SET-006 | SET-NOTIFY-001 | 通知开关切换功能 | 功能测试 | P2 |
| TC-SET-007 | SET-SEC-001 | 安全设置数值边界验证 | 功能测试 | P2 |
| TC-SET-008 | - | 未登录用户访问权限 | 集成测试 | P0 |
| TC-SET-009 | - | 非管理员用户访问权限 | 集成测试 | P0 |
| TC-SET-010 | - | 网络错误处理 | E2E测试 | P1 |

---

## 2. 详细测试用例

### TC-SET-001: 页面加载时正确显示数据库设置

**对应需求**: SET-SITE-001  
**测试类型**: 集成测试  
**优先级**: P0

**前置条件**:
- 后端服务已启动 (http://localhost:3001)
- 前端服务已启动 (http://localhost:3000)
- 数据库已初始化并包含测试数据
- 已存在管理员账号

**测试步骤**:
1. 登录管理员账号
2. 访问 http://localhost:3000/admin/settings
3. 观察页面加载后的表单值

**预期结果**:
- 页面显示加载状态（Spinner）
- 加载完成后，表单字段显示数据库中的值
- 网站名称输入框显示 "NovelHub"（或数据库中的实际值）
- 维护模式开关状态与数据库一致
- 允许注册开关状态与数据库一致

**验证点**:
```typescript
// API 响应验证
const response = await api.get('/admin/settings');
expect(response.data.settings).toHaveProperty('siteName');
expect(response.data.settings).toHaveProperty('maintenanceMode');
expect(response.data.settings).toHaveProperty('registrationEnabled');
```

---

### TC-SET-002: 修改网站名称并保存成功

**对应需求**: SET-SITE-001  
**测试类型**: E2E测试  
**优先级**: P0

**前置条件**:
- 已完成 TC-SET-001
- 页面已加载完成

**测试步骤**:
1. 清除网站名称输入框
2. 输入新的网站名称 "TestHub"
3. 点击"保存设置"按钮
4. 等待保存完成
5. 刷新页面

**预期结果**:
- 点击保存后按钮显示加载状态
- 保存成功后显示成功提示"设置保存成功"
- 刷新页面后网站名称仍显示 "TestHub"
- 数据库中 siteName 值已更新

**验证点**:
```typescript
// 数据库验证
const config = await prisma.systemConfig.findUnique({
  where: { key: 'siteName' }
});
expect(config.value).toBe('TestHub');
```

---

### TC-SET-003: 切换维护模式开关并保存

**对应需求**: SET-SITE-001  
**测试类型**: E2E测试  
**优先级**: P0

**前置条件**:
- 维护模式当前为关闭状态

**测试步骤**:
1. 点击"维护模式"开关，将其开启
2. 点击"保存设置"按钮
3. 等待保存完成
4. 打开新的浏览器窗口访问首页

**预期结果**:
- 开关状态切换为开启
- 保存成功后显示成功提示
- 新窗口访问首页时显示维护页面（如已实现）

**清理**:
- 测试完成后关闭维护模式并保存

---

### TC-SET-004: 关闭注册功能并验证生效

**对应需求**: SET-SITE-001  
**测试类型**: E2E测试  
**优先级**: P1

**前置条件**:
- 注册功能当前为开启状态

**测试步骤**:
1. 点击"允许注册"开关，将其关闭
2. 点击"保存设置"按钮
3. 登出管理员账号
4. 访问注册页面尝试注册

**预期结果**:
- 开关状态切换为关闭
- 保存成功
- 注册页面显示"注册已关闭"提示或无法访问（如已实现）

**清理**:
- 重新登录管理员账号
- 开启注册功能并保存

---

### TC-SET-005: 空网站名称验证

**对应需求**: SET-SITE-001  
**测试类型**: 功能测试  
**优先级**: P1

**前置条件**:
- 页面已加载

**测试步骤**:
1. 清除网站名称输入框
2. 点击"保存设置"按钮

**预期结果**:
- 显示错误提示"网站名称不能为空"或类似提示
- 数据未保存到数据库

---

### TC-SET-006: 通知开关切换功能

**对应需求**: SET-NOTIFY-001  
**测试类型**: 功能测试  
**优先级**: P2

**前置条件**:
- 页面已加载
- 当前在"通知设置"Tab

**测试步骤**:
1. 依次点击每个通知开关
2. 观察开关状态变化
3. 点击"保存设置"按钮

**预期结果**:
- 所有开关可以正常切换
- 开关有平滑的动画效果
- 保存后显示成功提示（当前为演示模式）

---

### TC-SET-007: 安全设置数值边界验证

**对应需求**: SET-SEC-001  
**测试类型**: 功能测试  
**优先级**: P2

**前置条件**:
- 页面已加载
- 当前在"安全设置"Tab

**测试步骤**:
1. 在"最大登录尝试次数"输入框输入 0
2. 在"密码过期天数"输入框输入 20
3. 在"会话超时时间"输入框输入 500
4. 点击"保存设置"按钮

**预期结果**:
- 输入 0 时被纠正为 1（最小值）
- 输入 20 时被纠正为 30（最小值）
- 输入 500 时被纠正为 480（最大值）
- 保存成功

---

### TC-SET-008: 未登录用户访问权限

**对应需求**: 权限控制  
**测试类型**: 集成测试  
**优先级**: P0

**前置条件**:
- 用户未登录
- Cookie 中无有效 token

**测试步骤**:
1. 清除浏览器 Cookie/LocalStorage
2. 直接访问 http://localhost:3000/admin/settings

**预期结果**:
- 页面重定向到登录页 http://localhost:3000/admin/login
- 显示提示"请先登录"

**验证点**:
```typescript
// API 验证
const response = await api.get('/admin/settings');
expect(response.status).toBe(401);
```

---

### TC-SET-009: 非管理员用户访问权限

**对应需求**: 权限控制  
**测试类型**: 集成测试  
**优先级**: P0

**前置条件**:
- 已注册读者账号
- 用户非管理员角色

**测试步骤**:
1. 使用读者账号登录
2. 访问 http://localhost:3000/admin/settings

**预期结果**:
- 页面显示 403 错误或无权限提示
- 或重定向到首页

**验证点**:
```typescript
// API 验证
const response = await api.get('/admin/settings', {
  headers: { Authorization: `Bearer ${userToken}` }
});
expect(response.status).toBe(403);
```

---

### TC-SET-010: 网络错误处理

**对应需求**: 错误处理  
**测试类型**: E2E测试  
**优先级**: P1

**前置条件**:
- 页面已加载
- 可以模拟网络断开

**测试步骤**:
1. 修改网站名称
2. 断开网络连接（或使用开发者工具模拟离线）
3. 点击"保存设置"按钮

**预期结果**:
- 显示错误提示"保存失败"或"网络错误"
- 按钮恢复可点击状态
- 页面数据保持不变

---

## 3. 自动化测试代码

### 3.1 Playwright E2E 测试

```typescript
// case/coding/admin/system-settings.e2e.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './test-helpers';

test.describe('系统设置页 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('http://localhost:3000/admin/settings');
    await page.waitForSelector('[data-testid="settings-form"]', { timeout: 10000 });
  });

  test('TC-SET-001: 页面加载时正确显示设置', async ({ page }) => {
    const siteNameInput = page.locator('input#siteName');
    await expect(siteNameInput).toHaveValue(/NovelHub|./);
    
    const maintenanceSwitch = page.locator('[data-testid="maintenance-mode-switch"]');
    await expect(maintenanceSwitch).toBeVisible();
  });

  test('TC-SET-002: 修改网站名称并保存', async ({ page }) => {
    const siteNameInput = page.locator('input#siteName');
    await siteNameInput.fill('TestHub');
    
    await page.click('button:has-text("保存设置")');
    await expect(page.locator('text=设置保存成功')).toBeVisible();
    
    // 刷新验证
    await page.reload();
    await expect(siteNameInput).toHaveValue('TestHub');
    
    // 恢复原始值
    await siteNameInput.fill('NovelHub');
    await page.click('button:has-text("保存设置")');
  });

  test('TC-SET-003: 切换维护模式开关', async ({ page }) => {
    const switch = page.locator('[data-testid="maintenance-mode-switch"]');
    const isChecked = await switch.isChecked();
    
    await switch.click();
    await page.click('button:has-text("保存设置")');
    await expect(page.locator('text=设置保存成功')).toBeVisible();
    
    // 恢复
    await switch.click();
    await page.click('button:has-text("保存设置")');
  });

  test('TC-SET-008: 未登录用户重定向到登录页', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('http://localhost:3000/admin/settings');
    await expect(page).toHaveURL(/.*login.*/);
  });
});
```

### 3.2 API 集成测试

```typescript
// case/backend/admin/settings-api.spec.ts
import { test, expect } from '@playwright/test';
import { getAdminToken, getUserToken } from './test-helpers';

test.describe('系统设置 API 测试', () => {
  const baseURL = 'http://localhost:3001';
  
  test('TC-SET-001: 获取系统设置', async ({ request }) => {
    const adminToken = await getAdminToken();
    
    const response = await request.get(`${baseURL}/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.settings).toBeDefined();
    expect(data.settings.siteName).toBeDefined();
  });

  test('TC-SET-002: 更新系统设置', async ({ request }) => {
    const adminToken = await getAdminToken();
    
    const response = await request.patch(`${baseURL}/admin/settings`, {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        siteName: 'TestName',
        maintenanceMode: false
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('TC-SET-008: 未认证访问返回 401', async ({ request }) => {
    const response = await request.get(`${baseURL}/admin/settings`);
    expect(response.status()).toBe(401);
  });

  test('TC-SET-009: 非管理员访问返回 403', async ({ request }) => {
    const userToken = await getUserToken();
    
    const response = await request.get(`${baseURL}/admin/settings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    
    expect(response.status()).toBe(403);
  });
});
```

---

## 4. 测试执行指南

### 4.1 环境准备

```bash
# 1. 启动后端服务
cd apps/backend
npm run start:dev

# 2. 启动前端服务
cd apps/frontend
npm run dev

# 3. 确保数据库已初始化并包含测试数据
npx prisma migrate dev
npx prisma db seed
```

### 4.2 运行测试

```bash
# 运行 E2E 测试
npx playwright test case/coding/admin/system-settings.e2e.spec.ts

# 运行 API 测试
npx playwright test case/backend/admin/settings-api.spec.ts

# 运行所有系统设置相关测试
npx playwright test --grep "系统设置"
```

### 4.3 测试数据准备

```typescript
// 测试前准备
await prisma.systemConfig.upsert({
  where: { key: 'siteName' },
  create: { key: 'siteName', value: 'NovelHub', description: '网站名称' },
  update: { value: 'NovelHub' }
});

await prisma.systemConfig.upsert({
  where: { key: 'maintenanceMode' },
  create: { key: 'maintenanceMode', value: false, description: '维护模式' },
  update: { value: false }
});
```

---

## 5. 变更历史

| 日期 | 版本 | 变更内容 | AI智能体作家 |
|------|------|----------|------|
| 2026-04-19 | v1.0 | 初始测试用例文档 | AI Assistant |

---

**文档结束**
