# 创作中心AI智能体管理测试用例

## 1. 需求理解

### 功能描述
AI智能体管理页面（`/author/agents`）是统一管理AI作家和AI评审员的入口。创AI智能体作家可以：
- 查看已绑定的AI作家和AI评审员
- 了解AI作家和AI评审员的接入流程
- 获取API接口文档
- 跳转到个人中心完成领取

### 涉及页面
- AI智能体管理: `/author/agents`
- 个人中心: `/profile` (领取入口)
- 评审中心: `/reviewer`
- 登录页面: `/login` (未登录时跳转)

### 关键功能点
1. **我的AI作家Tab**: 展示已绑定的AI作家列表
2. **我的AI评审员Tab**: 展示已绑定的AI评审员列表和升级机制
3. **接入AI作家Tab**: AI作家接入文档和SOP
4. **接入AI评审员Tab**: AI评审员接入文档和SOP
5. 机制说明卡片（AI作家和AI评审员）
6. 跳转到个人中心领取

---

## 2. 测试策略

### 测试类型覆盖
- **E2E 测试**: 页面跳转、Tab切换、领取流程
- **集成测试**: API调用、数据展示
- **UI测试**: Tab交互、卡片展示

### 测试优先级
- P0: Tab功能、列表展示、跳转功能
- P1: 接入文档、机制说明
- P2: 空状态、加载状态

---

## 3. 测试用例

### 3.1 页面访问与布局

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-001 | US-AGENT-001-权限检查 | 未登录用户访问被重定向 | E2E | 1. 前端服务已启动<br>2. 用户未登录 | 1. 清除登录状态<br>2. 访问 `/author/agents` | 1. 页面重定向到 `/login`<br>2. 登录后返回原页面 | P0 |
| AGENT-002 | US-AGENT-002-已登录访问 | 已登录用户正常访问 | E2E | 1. 前端服务已启动<br>2. 用户已登录 | 1. 登录用户账号<br>2. 访问 `/author/agents` | 1. AI智能体管理页面正常加载<br>2. 显示4个Tab | P0 |
| AGENT-003 | US-AGENT-003-页面标题 | 页面标题和描述正确 | UI测试 | 同 AGENT-002 | 1. 访问 `/author/agents` | 1. 显示标题"AI 智能体管理"<br>2. 显示描述文字 | P1 |

### 3.2 Tab功能测试

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-004 | US-AGENT-004-Tab显示 | 4个Tab正确显示 | UI测试 | 同 AGENT-002 | 1. 访问 `/author/agents` | 1. 显示"我的AI作家"Tab<br>2. 显示"我的AI评审员"Tab<br>3. 显示"接入AI作家"Tab<br>4. 显示"接入AI评审员"Tab | P0 |
| AGENT-005 | US-AGENT-005-Tab切换 | Tab切换正常 | E2E | 同 AGENT-002 | 1. 点击"我的AI评审员"Tab<br>2. 点击"接入AI作家"Tab<br>3. 点击"接入AI评审员"Tab | 1. 每次点击显示对应内容<br>2. Tab高亮状态正确切换 | P0 |
| AGENT-006 | US-AGENT-006-默认Tab | 默认显示"我的AI作家" | E2E | 同 AGENT-002 | 1. 访问 `/author/agents` | 1. 默认选中"我的AI作家"Tab<br>2. 显示AI作家列表 | P0 |

### 3.3 我的AI作家Tab

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-007 | US-AGENT-007-机制说明卡片 | 显示AI作家机制说明 | UI测试 | 同 AGENT-002 | 1. 进入"我的AI作家"Tab | 1. 显示蓝色渐变机制说明卡片<br>2. 显示AI作家注册流程说明<br>3. 显示"去绑定AI智能体"按钮 | P0 |
| AGENT-008 | US-AGENT-008-跳转到个人中心 | 点击按钮跳转到个人中心 | E2E | 同 AGENT-002 | 1. 点击"去绑定AI智能体"按钮 | 1. 跳转到 `/profile`<br>2. 定位到绑定AI智能体Tab | P0 |
| AGENT-009 | US-AGENT-009-作家列表 | 显示已绑定的AI作家列表 | 集成测试 | 1. 用户已绑定AI作家 | 1. 进入"我的AI作家"Tab | 1. 显示AI作家卡片列表<br>2. 显示名称、ID、声誉分数<br>3. 显示AI作家标签 | P0 |
| AGENT-010 | US-AGENT-010-空状态 | 无AI作家时显示空状态 | UI测试 | 1. 用户未绑定AI作家 | 1. 进入"我的AI作家"Tab | 1. 显示空状态插图<br>2. 显示"还没有绑定AI智能体"<br>3. 显示"去绑定AI智能体"按钮 | P0 |
| AGENT-011 | US-AGENT-011-加载状态 | 列表加载时显示loading | UI测试 | 同 AGENT-002 | 1. 进入"我的AI作家"Tab<br>2. 观察加载过程 | 1. 显示加载动画<br>2. 显示"加载AI智能体列表..."文字 | P1 |

### 3.4 我的AI评审员Tab

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-012 | US-AGENT-012-评审员机制说明 | 显示AI评审员机制说明 | UI测试 | 同 AGENT-002 | 1. 进入"我的AI评审员"Tab | 1. 显示紫色渐变机制说明卡片<br>2. 显示AI评审员注册流程说明<br>3. 显示"去绑定AI评审员"按钮 | P0 |
| AGENT-013 | US-AGENT-013-升级机制说明 | 显示升级机制步骤 | UI测试 | 同 AGENT-002 | 1. 进入"我的AI评审员"Tab | 1. 显示4步升级机制<br>2. 步骤：独立注册→领取绑定→获得JUNIOR→声誉升级 | P0 |
| AGENT-014 | US-AGENT-014-级别体系展示 | 显示评审员级别体系 | UI测试 | 同 AGENT-002 | 1. 进入"我的AI评审员"Tab<br>2. 查看级别说明区域 | 1. 显示4个级别卡片<br>2. JUNIOR/INTERMEDIATE/SENIOR/EXPERT<br>3. 显示各级别声誉要求 | P0 |
| AGENT-015 | US-AGENT-015-评审员列表 | 显示已绑定的AI评审员列表 | 集成测试 | 1. 用户已绑定AI评审员 | 1. 进入"我的AI评审员"Tab | 1. 显示AI评审员卡片列表<br>2. 显示名称、ID、声誉分数<br>3. 显示级别标签（JUNIOR等） | P0 |
| AGENT-016 | US-AGENT-016-评审员空状态 | 无AI评审员时显示空状态 | UI测试 | 1. 用户未绑定AI评审员 | 1. 进入"我的AI评审员"Tab | 1. 显示空状态插图<br>2. 显示"还没有绑定AI评审员"<br>3. 显示"去绑定AI评审员"按钮 | P0 |

### 3.5 接入AI作家Tab

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-017 | US-AGENT-017-SOP流程展示 | 显示AI作家SOP流程 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI作家"Tab | 1. 显示蓝色主题SOP流程<br>2. 4个步骤：自助注册→获取验证码→人类验证→开始创作<br>3. 每个步骤显示状态标签 | P0 |
| AGENT-018 | US-AGENT-018-API文档 | 显示注册API文档 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI作家"Tab<br>2. 查看API文档区域 | 1. 显示 `/claws/self-register` API<br>2. 显示请求参数说明<br>3. 显示响应示例 | P0 |
| AGENT-019 | US-AGENT-019-领取流程文档 | 显示领取流程文档 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI作家"Tab<br>2. 查看领取流程 | 1. 显示CLAIM-XXXXXX格式说明<br>2. 显示领取API<br>3. 显示24小时过期提示 | P1 |

### 3.6 接入AI评审员Tab

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-020 | US-AGENT-020-评审员SOP流程 | 显示AI评审员SOP流程 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI评审员"Tab | 1. 显示紫色主题SOP流程<br>2. 4个步骤：独立注册→获取验证码→人类领取→开始评审<br>3. 每个步骤显示状态标签 | P0 |
| AGENT-021 | US-AGENT-021-评审员注册API | 显示评审员注册API | UI测试 | 同 AGENT-002 | 1. 进入"接入AI评审员"Tab<br>2. 查看API文档 | 1. 显示 `/claws/register-reviewer` API<br>2. 显示与作家API的区别<br>3. 显示响应包含level字段 | P0 |
| AGENT-022 | US-AGENT-022-REVIEWER格式 | 显示REVIEWER验证码格式 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI评审员"Tab<br>2. 查看领取流程 | 1. 显示REVIEWER-XXXXXX格式<br>2. 说明与CLAIM格式的区别<br>3. 显示领取后获得JUNIOR级别 | P0 |
| AGENT-023 | US-AGENT-023-升级机制文档 | 显示升级机制文档 | UI测试 | 同 AGENT-002 | 1. 进入"接入AI作家"Tab<br>2. 查看升级机制 | 1. 显示4个级别和声誉要求<br>2. 显示升级是自动的<br>3. 显示级别越高权重越大 | P1 |
| AGENT-024 | US-AGENT-024-评审API文档 | 显示参与评审API | UI测试 | 同 AGENT-002 | 1. 进入"接入AI评审员"Tab<br>2. 查看评审API | 1. 显示获取待评审列表API<br>2. 显示提交评审结果API<br>3. 显示评审参数说明 | P1 |

### 3.7 机制说明卡片

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-025 | US-AGENT-025-作家机制卡片 | AI作家机制说明正确 | UI测试 | 同 AGENT-002 | 1. 查看"我的AI作家"Tab机制卡片 | 1. 显示蓝色渐变背景<br>2. 显示Sparkles图标<br>3. 显示作家注册流程<br>4. 显示"去绑定AI智能体"按钮 | P0 |
| AGENT-026 | US-AGENT-026-评审员机制卡片 | AI评审员机制说明正确 | UI测试 | 同 AGENT-002 | 1. 查看"我的AI评审员"Tab机制卡片 | 1. 显示紫色渐变背景<br>2. 显示Sparkles图标<br>3. 显示评审员注册流程<br>4. 显示"去绑定AI评审员"按钮 | P0 |
| AGENT-027 | US-AGENT-027-双列布局 | 机制说明双列布局 | UI测试 | 同 AGENT-002 | 1. 查看机制说明卡片 | 1. 左侧显示作家流程<br>2. 右侧显示评审员流程<br>3. 两列并排显示 | P1 |

### 3.8 跨页面跳转

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| AGENT-028 | US-AGENT-028-跳转到个人中心 | 从创作中心跳转到个人中心 | E2E | 同 AGENT-002 | 1. 点击"去绑定AI智能体"按钮 | 1. 跳转到 `/profile`<br>2. 自动切换到"绑定AI智能体"Tab | P0 |
| AGENT-029 | US-AGENT-029-评审中心跳转 | 从评审中心跳转到创作中心 | E2E | 1. 访问 `/reviewer` | 1. 点击"AI智能体管理"按钮 | 1. 跳转到 `/author/agents`<br>2. 显示AI智能体管理页面 | P0 |

---

## 4. 测试代码

### 4.1 Playwright E2E测试

```typescript
// case/coding/frontend/author/agent-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('AI智能体管理页面', () => {
  test.beforeEach(async ({ page }) => {
    // 登录并访问页面
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
    await page.goto('/author/agents');
  });

  test('页面显示4个Tab', async ({ page }) => {
    await expect(page.locator('text=我的AI作家')).toBeVisible();
    await expect(page.locator('text=我的AI评审员')).toBeVisible();
    await expect(page.locator('text=接入AI作家')).toBeVisible();
    await expect(page.locator('text=接入AI评审员')).toBeVisible();
  });

  test('Tab切换正常', async ({ page }) => {
    // 点击我的AI评审员Tab
    await page.click('text=我的AI评审员');
    await expect(page.locator('text=AI评审员升级机制')).toBeVisible();
    
    // 点击接入AI作家Tab
    await page.click('text=接入AI作家');
    await expect(page.locator('text=AI作家接入指南')).toBeVisible();
    
    // 点击接入AI评审员Tab
    await page.click('text=接入AI评审员');
    await expect(page.locator('text=AI评审员接入指南')).toBeVisible();
  });

  test('跳转到个人中心', async ({ page }) => {
    await page.click('text=去绑定AI智能体');
    await expect(page).toHaveURL(/.*\/profile.*/);
  });
});
```

### 4.2 我的AI评审员Tab测试

```typescript
// case/coding/frontend/author/ai-reviewer-tab.spec.ts
import { test, expect } from '@playwright/test';

test.describe('我的AI评审员Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
    await page.goto('/author/agents');
    await page.click('text=我的AI评审员');
  });

  test('显示升级机制说明', async ({ page }) => {
    await expect(page.locator('text=AI评审员升级机制')).toBeVisible();
    await expect(page.locator('text=独立注册')).toBeVisible();
    await expect(page.locator('text=领取绑定')).toBeVisible();
    await expect(page.locator('text=获得JUNIOR身份')).toBeVisible();
    await expect(page.locator('text=声誉升级')).toBeVisible();
  });

  test('显示级别体系', async ({ page }) => {
    await expect(page.locator('text=JUNIOR')).toBeVisible();
    await expect(page.locator('text=INTERMEDIATE')).toBeVisible();
    await expect(page.locator('text=SENIOR')).toBeVisible();
    await expect(page.locator('text=EXPERT')).toBeVisible();
  });

  test('显示机制说明卡片', async ({ page }) => {
    await expect(page.locator('text=AI智能体自助注册机制')).toBeVisible();
    await expect(page.locator('text=AI通过独立API注册')).toBeVisible();
  });
});
```

### 4.3 接入文档Tab测试

```typescript
// case/coding/frontend/author/integration-docs-tab.spec.ts
import { test, expect } from '@playwright/test';

test.describe('接入AI作家Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
    await page.goto('/author/agents');
    await page.click('text=接入AI作家');
  });

  test('显示SOP流程', async ({ page }) => {
    await expect(page.locator('text=接入流程 SOP')).toBeVisible();
    await expect(page.locator('text=自助注册')).toBeVisible();
    await expect(page.locator('text=获取验证码')).toBeVisible();
    await expect(page.locator('text=人类验证')).toBeVisible();
    await expect(page.locator('text=开始创作')).toBeVisible();
  });

  test('显示API文档', async ({ page }) => {
    await expect(page.locator('text=/claws/self-register')).toBeVisible();
    await expect(page.locator('text=CLAIM-')).toBeVisible();
  });
});

test.describe('接入AI评审员Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
    await page.goto('/author/agents');
    await page.click('text=接入AI评审员');
  });

  test('显示评审员SOP流程', async ({ page }) => {
    await expect(page.locator('text=接入流程 SOP')).toBeVisible();
    await expect(page.locator('text=独立注册')).toBeVisible();
    await expect(page.locator('text=开始评审')).toBeVisible();
  });

  test('显示评审员注册API', async ({ page }) => {
    await expect(page.locator('text=/claws/register-reviewer')).toBeVisible();
    await expect(page.locator('text=REVIEWER-')).toBeVisible();
    await expect(page.locator('text=JUNIOR')).toBeVisible();
  });
});
```

---

## 5. 测试数据

### 5.1 测试账号
```json
{
  "writerUser": {
    "email": "writer@test.com",
    "password": "test123",
    "boundClaws": [
      {
        "clawId": "ai_writer_001",
        "displayName": "测试AI作家",
        "isWriter": true,
        "isReviewer": false,
        "reputationScore": 100
      }
    ]
  },
  "reviewerUser": {
    "email": "reviewer@test.com",
    "password": "test123",
    "boundClaws": [
      {
        "clawId": "ai_reviewer_001",
        "displayName": "测试AI评审员",
        "isWriter": false,
        "isReviewer": true,
        "reviewerLevel": "JUNIOR",
        "reputationScore": 0
      }
    ]
  },
  "dualUser": {
    "email": "dual@test.com",
    "password": "test123",
    "boundClaws": [
      {
        "clawId": "ai_writer_002",
        "displayName": "AI作家二号",
        "isWriter": true,
        "isReviewer": false
      },
      {
        "clawId": "ai_reviewer_002",
        "displayName": "AI评审员二号",
        "isWriter": false,
        "isReviewer": true,
        "reviewerLevel": "INTERMEDIATE",
        "reputationScore": 150
      }
    ]
  }
}
```

---

## 6. 测试执行计划

### 6.1 执行顺序
1. 权限控制测试 (AGENT-001 ~ AGENT-003)
2. Tab功能测试 (AGENT-004 ~ AGENT-006)
3. 我的AI作家Tab测试 (AGENT-007 ~ AGENT-011)
4. 我的AI评审员Tab测试 (AGENT-012 ~ AGENT-016)
5. 接入AI作家Tab测试 (AGENT-017 ~ AGENT-019)
6. 接入AI评审员Tab测试 (AGENT-020 ~ AGENT-024)
7. 机制说明卡片测试 (AGENT-025 ~ AGENT-027)
8. 跨页面跳转测试 (AGENT-028 ~ AGENT-029)

### 6.2 回归测试重点
- Tab切换功能
- 跳转到个人中心
- 列表数据展示
- 空状态处理

---

## 7. 同步记录

| 日期 | 版本 | 变更内容 | 变更人 |
|------|------|----------|--------|
| 2026-04-18 | v1.0 | 初始版本，Agent创建和管理 | AI Agent |
| 2026-04-19 | v2.0 | 更新为AI作家和AI评审员双身份管理，新增4个Tab结构 | AI Agent |

---

## 8. 相关文档

- [AI智能体自助注册需求](../../requirements/ai-agent-self-registration-requirements.md)
- [个人中心AI智能体绑定需求](../../requirements/profile-claw-binding-requirements.md)
- [评审中心需求文档](../../requirements/reviewer-center-requirements.md)
- [AI智能体接入设计](../../design/ai-agent-integration-design.md)
