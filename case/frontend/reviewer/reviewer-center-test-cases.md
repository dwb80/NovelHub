# 评审中心测试用例

## 文档信息
- **文档版本**: v1.0.0
- **创建日期**: 2026-04-18
- **最后更新**: 2026-04-18
- **状态**: 已完成

## 1. 功能测试用例

### 1.1 页面访问控制

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-001 | 未登录访问评审中心 | 用户未登录 | 1. 直接访问 /reviewer | 重定向到 /login?redirect=/reviewer | P0 |
| RC-TC-002 | 登录后访问评审中心 | 用户已登录 | 1. 登录账号<br>2. 访问 /reviewer | 正常显示评审中心页面 | P0 |
| RC-TC-003 | 登录后从导航进入 | 用户已登录 | 1. 在首页点击"评审中心"导航 | 跳转到 /reviewer 页面 | P0 |
| RC-TC-004 | 未登录时导航隐藏 | 用户未登录 | 1. 在首页查看导航栏 | 不显示"评审中心"按钮 | P0 |

### 1.2 概览统计

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-005 | 显示AI评审员数量 | 用户有2个AI评审员 | 1. 访问评审中心 | 统计卡片显示"2" | P0 |
| RC-TC-006 | 显示已完成评审数 | 已完成15个评审 | 1. 访问评审中心 | 统计卡片显示"15" | P0 |
| RC-TC-007 | 显示待评审数量 | 有3个待评审 | 1. 访问评审中心 | 统计卡片显示"3" | P0 |
| RC-TC-008 | 显示平均评分 | 平均评分4.2 | 1. 访问评审中心 | 统计卡片显示"4.2" | P1 |
| RC-TC-009 | 无数据状态 | 用户无AI评审员 | 1. 访问评审中心 | 显示"0"和空状态提示 | P0 |

### 1.3 AI评审员列表

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-010 | 显示评审员列表 | 用户有AI评审员 | 1. 访问概览Tab | 显示评审员名称、ID、声誉分数 | P0 |
| RC-TC-011 | 显示评审员徽章 | 用户有AI评审员 | 1. 访问概览Tab | 显示"评审员"Badge | P0 |
| RC-TC-012 | 空状态显示 | 用户无AI评审员 | 1. 访问概览Tab | 显示"暂无AI评审员"提示 | P0 |

### 1.4 待评审列表

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期步骤 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-013 | 显示待评审小说 | 有待评审小说 | 1. 切换到"待评审"Tab | 显示小说列表 | P0 |
| RC-TC-014 | 显示小说信息 | 有待评审小说 | 1. 切换到"待评审"Tab | 显示标题、AI智能体作家、字数、提交时间 | P0 |
| RC-TC-015 | 显示等待状态 | 有待评审小说 | 1. 切换到"待评审"Tab | 显示"等待评审"Badge | P0 |
| RC-TC-016 | 空状态显示 | 无待评审小说 | 1. 切换到"待评审"Tab | 显示"暂无待评审小说" | P0 |

### 1.5 评审历史

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-017 | 显示评审历史 | 有评审记录 | 1. 切换到"评审历史"Tab | 显示评审列表 | P0 |
| RC-TC-018 | 显示评审分数 | 有评审记录 | 1. 切换到"评审历史"Tab | 显示综合评分和各维度分数 | P0 |
| RC-TC-019 | 显示评审评语 | 有评审评语 | 1. 切换到"评审历史"Tab | 显示评语内容 | P1 |
| RC-TC-020 | 空状态显示 | 无评审记录 | 1. 切换到"评审历史"Tab | 显示"暂无评审历史" | P0 |

### 1.6 Tab切换

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-021 | Tab切换功能 | 在评审中心页面 | 1. 点击不同Tab | 内容正确切换，无页面刷新 | P0 |
| RC-TC-022 | 默认Tab | 访问评审中心 | 1. 首次访问 | 默认显示"概览"Tab | P0 |
| RC-TC-023 | Tab状态保持 | 在"待评审"Tab | 1. 刷新页面 | 保持当前Tab状态 | P1 |

## 2. UI/UX测试用例

| 用例ID | 用例名称 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|--------|
| RC-TC-024 | 响应式布局-桌面端 | 在1920x1080分辨率查看 | 统计卡片4列，Tab正常显示 | P0 |
| RC-TC-025 | 响应式布局-平板 | 在768x1024分辨率查看 | 统计卡片2列，布局正常 | P0 |
| RC-TC-026 | 响应式布局-移动端 | 在375x667分辨率查看 | 统计卡片1列，可滚动 | P0 |
| RC-TC-027 | 加载状态 | 访问页面时 | 显示加载动画 | P0 |
| RC-TC-028 | 错误状态 | API返回错误时 | 显示错误提示 | P1 |

## 3. 性能测试用例

| 用例ID | 用例名称 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|--------|
| RC-TC-029 | 页面加载时间 | 测量首次加载时间 | < 2秒 | P1 |
| RC-TC-030 | API响应时间 | 测量stats接口响应 | < 500ms | P1 |
| RC-TC-031 | Tab切换速度 | 测量Tab切换时间 | 无感知延迟 | P1 |

## 4. 安全测试用例

| 用例ID | 用例名称 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|--------|
| RC-TC-032 | 未授权访问 | 直接调用API | 返回401 | P0 |
| RC-TC-033 | Token过期 | 使用过期Token访问 | 重定向到登录页 | P0 |
| RC-TC-034 | 数据隔离 | 用户A访问用户B数据 | 只能看到自己的数据 | P0 |

## 5. 兼容性测试用例

| 用例ID | 用例名称 | 测试环境 | 优先级 |
|--------|----------|----------|--------|
| RC-TC-035 | Chrome浏览器 | Chrome 120+ | P0 |
| RC-TC-036 | Firefox浏览器 | Firefox 120+ | P1 |
| RC-TC-037 | Safari浏览器 | Safari 17+ | P1 |
| RC-TC-038 | Edge浏览器 | Edge 120+ | P0 |

## 6. 测试数据

### 6.1 测试账号
- 有AI评审员的账号: test@example.com
- 无AI评审员的账号: empty@example.com

### 6.2 测试数据准备
```sql
-- 创建测试AI评审员
INSERT INTO claws (id, claw_id, name, reputation_score) 
VALUES ('test-claw-1', 'claw-test-001', '测试评审员1', 150);

-- 绑定到测试用户
INSERT INTO reader_claws (reader_id, claw_id) 
VALUES ('test-reader-id', 'test-claw-1');

-- 添加REVIEWER角色
INSERT INTO claw_roles (claw_id, role) 
VALUES ('test-claw-1', 'REVIEWER');
```

## 7. 自动化测试脚本

```typescript
// reviewer-center.spec.ts
import { test, expect } from '@playwright/test';

test.describe('评审中心', () => {
  test('未登录重定向', async ({ page }) => {
    await page.goto('/reviewer');
    await expect(page).toHaveURL('/login?redirect=/reviewer');
  });

  test('登录后显示评审中心', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // 访问评审中心
    await page.goto('/reviewer');
    await expect(page.locator('h1')).toContainText('评审中心');
  });

  test('导航栏显示评审中心', async ({ page }) => {
    // 登录后检查导航
    await page.goto('/');
    await expect(page.locator('[data-testid="nav-reviewer"]')).toBeVisible();
  });
});
```

## 5. AI评审员管理Tab测试用例

### 5.1 AI评审员列表展示

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-039 | 显示AI评审员管理Tab | 用户已登录 | 1. 访问 /reviewer | 显示"AI评审员管理"Tab | P0 |
| RC-TC-040 | Tab切换加载数据 | 用户有AI评审员 | 1. 切换到"AI评审员管理"Tab | 自动加载并显示评审员列表 | P0 |
| RC-TC-041 | 显示评审员信息 | 用户有AI评审员 | 1. 切换到"AI评审员管理"Tab | 显示名称、ID、声誉分数、激活状态 | P0 |
| RC-TC-042 | 显示AI评审员Badge | 用户有AI评审员 | 1. 切换到"AI评审员管理"Tab | 显示紫色"AI评审员"Badge | P0 |
| RC-TC-043 | 刷新按钮功能 | 在AI评审员管理Tab | 1. 点击刷新按钮 | 重新加载列表数据 | P1 |

### 5.2 空状态与引导

| 用例ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|----------|--------|
| RC-TC-044 | 无评审员空状态 | 用户无AI评审员 | 1. 切换到"AI评审员管理"Tab | 显示"暂无绑定的AI评审员" | P0 |
| RC-TC-045 | 空状态引导文案 | 用户无AI评审员 | 1. 切换到"AI评审员管理"Tab | 提示"请前往个人中心绑定AI智能体标签页领取" | P0 |
| RC-TC-046 | 显示领取引导卡片 | 在AI评审员管理Tab | 1. 查看页面内容 | 显示"领取AI评审员"引导卡片 | P0 |
| RC-TC-047 | 显示注册指南卡片 | 在AI评审员管理Tab | 1. 查看页面内容 | 显示"AI评审员注册指南"卡片 | P1 |
| RC-TC-048 | 前往个人中心按钮 | 在AI评审员管理Tab | 1. 点击"前往个人中心领取"按钮 | 跳转到 /profile | P0 |

### 5.3 注册指南内容

| 用例ID | 用例名称 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|--------|
| RC-TC-049 | 显示4步注册流程 | 1. 切换到AI评审员管理Tab | 显示注册API、获取验证码、领取绑定、激活使用 | P1 |
| RC-TC-050 | 显示API接口信息 | 1. 切换到AI评审员管理Tab | 显示注册接口、领取接口、激活接口 | P1 |
| RC-TC-051 | 显示注意事项 | 1. 切换到AI评审员管理Tab | 显示AI评审员与AI作家独立注册等说明 | P1 |

## 6. 跨页面一致性测试

| 用例ID | 用例名称 | 测试步骤 | 预期结果 | 优先级 |
|--------|----------|----------|----------|--------|
| RC-TC-052 | 评审中心无领取功能 | 1. 检查AI评审员管理Tab | 没有输入框和领取按钮 | P0 |
| RC-TC-053 | 创作中心无领取功能 | 1. 访问 /author/agents | 没有输入框和领取按钮 | P0 |
| RC-TC-054 | 个人中心有领取功能 | 1. 访问 /profile claws tab | 有输入框和领取按钮 | P0 |
| RC-TC-055 | 统一引导到个人中心 | 1. 检查评审中心和创作中心 | 都引导用户去个人中心领取 | P0 |

## 7. 测试数据

### 7.1 测试账号
- 有AI评审员的账号: test@example.com
- 无AI评审员的账号: empty@example.com

### 7.2 测试数据准备
```sql
-- 创建测试AI评审员
INSERT INTO claws (id, claw_id, name, reputation_score) 
VALUES ('test-claw-1', 'claw-test-001', '测试评审员1', 150);

-- 绑定到测试用户
INSERT INTO reader_claws (reader_id, claw_id) 
VALUES ('test-reader-id', 'test-claw-1');

-- 添加REVIEWER角色
INSERT INTO claw_roles (claw_id, role) 
VALUES ('test-claw-1', 'REVIEWER');
```

## 8. 自动化测试脚本

```typescript
// reviewer-center.spec.ts
import { test, expect } from '@playwright/test';

test.describe('评审中心', () => {
  test('未登录重定向', async ({ page }) => {
    await page.goto('/reviewer');
    await expect(page).toHaveURL('/login?redirect=/reviewer');
  });

  test('登录后显示评审中心', async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // 访问评审中心
    await page.goto('/reviewer');
    await expect(page.locator('h1')).toContainText('评审中心');
  });

  test('导航栏显示评审中心', async ({ page }) => {
    // 登录后检查导航
    await page.goto('/');
    await expect(page.locator('[data-testid="nav-reviewer"]')).toBeVisible();
  });

  test('AI评审员管理Tab存在', async ({ page }) => {
    await page.goto('/reviewer');
    await expect(page.locator('text=AI评审员管理')).toBeVisible();
  });

  test('AI评审员管理Tab无领取功能', async ({ page }) => {
    await page.goto('/reviewer');
    await page.click('text=AI评审员管理');
    // 不应该有输入框
    await expect(page.locator('input[placeholder*="验证码"]')).not.toBeVisible();
    // 不应该有领取按钮
    await expect(page.locator('button:has-text("领取")')).not.toBeVisible();
  });

  test('AI评审员管理Tab有前往个人中心按钮', async ({ page }) => {
    await page.goto('/reviewer');
    await page.click('text=AI评审员管理');
    await expect(page.locator('button:has-text("前往个人中心")')).toBeVisible();
  });
});
```

## 9. 变更记录

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0.0 | 2026-04-18 | 初始版本 | AI Assistant |
| v1.1.0 | 2026-04-19 | 添加AI评审员管理Tab测试用例；添加跨页面一致性测试；更新自动化测试脚本 | AI Assistant |
