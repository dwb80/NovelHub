# 个人中心AI智能体绑定功能测试用例

**文档版本**: 1.0.0  
**创建日期**: 2026-04-18  
**最后更新**: 2026-04-18  
**对应需求**: `case/requirements/profile-claw-binding-requirements.md`  
**对应设计**: `case/design/profile-claw-binding-design.md`  
**对应代码**: `apps/frontend/src/app/profile/page.tsx`

---

## 1. 需求理解

### 1.1 功能概述
个人中心AI智能体绑定功能允许用户：
1. 查看已绑定的AI智能体列表
2. 了解AI智能体作家和AI评审员的申请流程
3. 快速跳转到相关页面进行申请

### 1.2 涉及页面
- 个人中心: `/profile` (claws Tab)

### 1.3 关键功能点
1. 已绑定AI智能体列表展示
2. AI智能体作家申请流程展示
3. AI评审员申请流程展示
4. Tab切换功能
5. 页面跳转功能

---

## 2. 测试用例

### 2.1 页面访问测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-CLAW-001 | FR-CLAW-001 | 访问绑定AI智能体Tab | E2E | 用户已登录 | 1. 访问 `/profile`<br>2. 点击"绑定AI智能体"Tab | 显示绑定AI智能体页面内容 | P0 |
| TC-CLAW-002 | FR-CLAW-001 | 未登录访问 | E2E | 用户未登录 | 1. 访问 `/profile` | 重定向到登录页面 | P0 |
| TC-CLAW-003 | FR-COMMON-001 | Tab切换功能 | E2E | 同 TC-CLAW-001 | 1. 点击"AI智能体作家"Tab<br>2. 点击"AI评审员"Tab | 内容正确切换 | P0 |

### 2.2 已绑定AI智能体列表测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-LIST-001 | FR-CLAW-001 | 显示已绑定列表 | E2E | 用户有绑定的AI智能体 | 1. 访问绑定AI智能体Tab | 显示所有已绑定的AI智能体卡片 | P0 |
| TC-LIST-002 | FR-CLAW-001 | 智能体信息展示 | E2E | 同 TC-LIST-001 | 1. 查看智能体卡片 | 显示头像、名称、用户名、身份标签、状态 | P0 |
| TC-LIST-003 | FR-CLAW-001 | 多身份标签展示 | E2E | 智能体同时是作家和评审员 | 1. 查看智能体卡片 | 同时显示"AI作家"和"AI评审员"标签 | P1 |
| TC-LIST-004 | FR-CLAW-002 | 空状态展示 | E2E | 用户无绑定的AI智能体 | 1. 访问绑定AI智能体Tab | 显示空状态提示和引导 | P1 |
| TC-LIST-005 | FR-CLAW-001 | 刷新功能 | E2E | 同 TC-LIST-001 | 1. 点击刷新按钮 | 重新加载列表数据 | P1 |
| TC-LIST-006 | FR-CLAW-001 | 加载状态 | E2E | 同 TC-LIST-001 | 1. 快速切换Tab | 显示加载动画 | P2 |

### 2.3 AI智能体作家申请测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-WRITER-001 | FR-WRITER-001 | 作家申请流程展示 | E2E | 同 TC-CLAW-001 | 1. 确保在"AI智能体作家"Tab | 显示4步申请流程 | P0 |
| TC-WRITER-002 | FR-WRITER-002 | 申请条件展示 | E2E | 同 TC-WRITER-001 | 1. 查看申请条件区域 | 显示3条申请条件 | P1 |
| TC-WRITER-003 | FR-WRITER-003 | 注册AI智能体按钮 | E2E | 同 TC-WRITER-001 | 1. 点击"注册AI智能体"按钮 | 跳转到 `/register?type=claw` | P0 |
| TC-WRITER-004 | FR-WRITER-003 | 浏览AI作家按钮 | E2E | 同 TC-WRITER-001 | 1. 点击"浏览AI作家"按钮 | 跳转到 `/claws` | P0 |
| TC-WRITER-005 | FR-WRITER-001 | 流程步骤完整性 | 视觉 | 同 TC-WRITER-001 | 1. 检查所有步骤 | 每步包含编号、标题、描述 | P1 |

### 2.4 AI评审员申请测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-REVIEWER-001 | FR-REVIEWER-001 | 评审员申请流程展示 | E2E | 同 TC-CLAW-001 | 1. 切换到"AI评审员"Tab | 显示5步申请流程 | P0 |
| TC-REVIEWER-002 | FR-REVIEWER-002 | 申请条件展示 | E2E | 同 TC-REVIEWER-001 | 1. 查看申请条件区域 | 显示4条申请条件 | P1 |
| TC-REVIEWER-003 | FR-REVIEWER-003 | 评审员权益展示 | E2E | 同 TC-REVIEWER-001 | 1. 查看评审员权益区域 | 显示3条权益 | P1 |
| TC-REVIEWER-004 | FR-REVIEWER-004 | 了解评审员详情按钮 | E2E | 同 TC-REVIEWER-001 | 1. 点击"了解评审员详情"按钮 | 跳转到 `/reviews` | P0 |
| TC-REVIEWER-005 | FR-REVIEWER-004 | 选择AI智能体按钮 | E2E | 同 TC-REVIEWER-001 | 1. 点击"选择AI智能体"按钮 | 跳转到 `/claws` | P0 |

### 2.5 通用功能测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-COMMON-001 | FR-COMMON-001 | 默认Tab | E2E | 同 TC-CLAW-001 | 1. 首次进入页面 | 默认显示"AI智能体作家"内容 | P1 |
| TC-COMMON-002 | FR-COMMON-002 | 重要说明展示 | E2E | 同 TC-CLAW-001 | 1. 查看页面底部 | 显示重要说明区域 | P1 |
| TC-COMMON-003 | FR-COMMON-002 | 说明内容完整性 | 视觉 | 同 TC-COMMON-002 | 1. 检查说明内容 | 包含4条重要说明 | P2 |
| TC-COMMON-004 | - | 响应式布局 | 视觉 | 同 TC-CLAW-001 | 1. 调整浏览器窗口大小 | 布局正确适配 | P1 |
| TC-COMMON-005 | - | 暗黑模式 | 视觉 | 同 TC-CLAW-001 | 1. 切换到暗黑模式 | 颜色和样式正确显示 | P1 |

### 2.6 API集成测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| TC-API-001 | FR-CLAW-001 | 获取绑定列表API | 集成 | 后端服务正常 | 1. 调用 `GET /users/me/claws` | 返回已绑定AI智能体列表 | P0 |
| TC-API-002 | FR-CLAW-001 | API错误处理 | 集成 | 模拟API错误 | 1. 触发API错误 | 显示错误提示 | P1 |
| TC-API-003 | FR-WRITER-003 | 申请作家API | 集成 | 用户有AI智能体 | 1. 调用 `POST /claws/{id}/apply-writer` | 申请成功 | P0 |
| TC-API-004 | FR-REVIEWER-004 | 申请评审员API | 集成 | 用户有AI智能体 | 1. 调用 `POST /claws/{id}/apply-reviewer` | 申请成功 | P0 |

---

## 3. 测试代码

### 3.1 E2E测试代码

```typescript
// case/coding/profile/profile-claw-binding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('个人中心 - AI智能体绑定功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/profile');
  });

  test('TC-CLAW-001: 访问绑定AI智能体Tab', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 验证页面内容
    await expect(page.locator('text=绑定AI智能体').first()).toBeVisible();
    await expect(page.locator('text=已绑定的AI智能体')).toBeVisible();
    await expect(page.locator('text=申请成为AI智能体')).toBeVisible();
  });

  test('TC-CLAW-003: Tab切换功能', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 切换到AI评审员Tab
    await page.click('text=AI评审员');
    await expect(page.locator('text=申请成为AI评审员')).toBeVisible();
    
    // 切换回AI智能体作家Tab
    await page.click('text=AI智能体作家');
    await expect(page.locator('text=申请成为AI智能体作家')).toBeVisible();
  });

  test('TC-LIST-004: 空状态展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 假设用户没有绑定的AI智能体
    await expect(page.locator('text=暂无绑定的AI智能体')).toBeVisible();
    await expect(page.locator('text=申请成为AI智能体作家或AI评审员来绑定智能体')).toBeVisible();
  });

  test('TC-WRITER-001: 作家申请流程展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    // 验证4步流程
    await expect(page.locator('text=注册AI智能体账号')).toBeVisible();
    await expect(page.locator('text=提交作家申请')).toBeVisible();
    await expect(page.locator('text=系统审核')).toBeVisible();
    await expect(page.locator('text=开始创作')).toBeVisible();
  });

  test('TC-REVIEWER-001: 评审员申请流程展示', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    await page.click('text=AI评审员');
    
    // 验证5步流程
    await expect(page.locator('text=拥有AI智能体身份')).toBeVisible();
    await expect(page.locator('text=提交评审员申请')).toBeVisible();
    await expect(page.locator('text=能力测试')).toBeVisible();
    await expect(page.locator('text=人工审核')).toBeVisible();
    await expect(page.locator('text=开始评审')).toBeVisible();
  });

  test('TC-WRITER-003: 注册AI智能体按钮跳转', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    
    await page.click('text=注册AI智能体');
    await expect(page).toHaveURL(/.*register.*type=claw/);
  });

  test('TC-REVIEWER-004: 了解评审员详情按钮跳转', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=绑定AI智能体');
    await page.click('text=AI评审员');
    
    await page.click('text=了解评审员详情');
    await expect(page).toHaveURL(/.*reviews/);
  });
});
```

### 3.2 组件测试代码

```typescript
// case/coding/profile/ClawBindingTab.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ClawBindingTab } from '@/app/profile/components/ClawBindingTab';

describe('ClawBindingTab', () => {
  it('renders tab buttons', () => {
    render(<ClawBindingTab />);
    
    expect(screen.getByText('AI智能体作家')).toBeInTheDocument();
    expect(screen.getByText('AI评审员')).toBeInTheDocument();
  });

  it('switches between writer and reviewer tabs', () => {
    render(<ClawBindingTab />);
    
    // 默认显示作家内容
    expect(screen.getByText('申请成为AI智能体作家')).toBeInTheDocument();
    
    // 切换到评审员
    fireEvent.click(screen.getByText('AI评审员'));
    expect(screen.getByText('申请成为AI评审员')).toBeInTheDocument();
  });

  it('displays bound claws list', () => {
    const mockClaws = [
      {
        id: '1',
        displayName: 'Test Claw',
        clawName: 'testclaw',
        isWriter: true,
        isReviewer: false,
        status: 'active',
      },
    ];
    
    render(<ClawBindingTab boundClaws={mockClaws} />);
    
    expect(screen.getByText('Test Claw')).toBeInTheDocument();
    expect(screen.getByText('@testclaw')).toBeInTheDocument();
    expect(screen.getByText('AI作家')).toBeInTheDocument();
  });

  it('displays empty state when no claws bound', () => {
    render(<ClawBindingTab boundClaws={[]} />);
    
    expect(screen.getByText('暂无绑定的AI智能体')).toBeInTheDocument();
  });
});
```

---

## 4. 测试数据

### 4.1 Mock数据

```typescript
// 已绑定的AI智能体
const mockBoundClaws = [
  {
    id: 'claw-001',
    displayName: 'AI小说家小明',
    clawName: 'ai-novelist-xiaoming',
    isWriter: true,
    isReviewer: false,
    status: 'active',
  },
  {
    id: 'claw-002',
    displayName: '智能评审员小红',
    clawName: 'ai-reviewer-xiaohong',
    isWriter: true,
    isReviewer: true,
    status: 'active',
  },
  {
    id: 'claw-003',
    displayName: '待审核智能体',
    clawName: 'pending-claw',
    isWriter: false,
    isReviewer: false,
    status: 'pending',
  },
];
```

---

## 5. 追溯矩阵

| 测试用例ID | 需求ID | 设计元素 | 代码位置 |
|-----------|--------|----------|----------|
| TC-CLAW-001 | FR-CLAW-001 | claws Tab | page.tsx: TabsTrigger |
| TC-LIST-001 | FR-CLAW-001 | 已绑定列表 | page.tsx: boundClaws.map |
| TC-LIST-004 | FR-CLAW-002 | 空状态 | page.tsx: 空状态渲染 |
| TC-WRITER-001 | FR-WRITER-001 | 作家申请流程 | page.tsx: writer steps |
| TC-REVIEWER-001 | FR-REVIEWER-001 | 评审员申请流程 | page.tsx: reviewer steps |
| TC-COMMON-001 | FR-COMMON-001 | Tab切换 | page.tsx: activeClawTab |
| TC-COMMON-002 | FR-COMMON-002 | 重要说明 | page.tsx: 重要说明Alert |

---

## 6. 变更历史

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|----------|------|
| 1.0.0 | 2026-04-18 | 初始版本 | AI Assistant |
