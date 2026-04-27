# Token 过期提示功能测试用例

**最后更新**: 2026-04-19  
**功能模块**: Admin 管理后台 - Token 过期提示  
**测试类型**: 前端功能测试 / 集成测试

---

## 1. 测试用例汇总

| 用例ID | 用例名称 | 测试类型 | 优先级 | 对应需求 |
|--------|----------|----------|--------|----------|
| TC-TOKEN-001 | Token 监控启动测试 | 功能测试 | P0 | ADM-TOKEN-001 |
| TC-TOKEN-002 | Token 即将过期警告显示 | 功能测试 | P0 | ADM-TOKEN-001 |
| TC-TOKEN-003 | 倒计时实时更新测试 | 功能测试 | P0 | ADM-TOKEN-001 |
| TC-TOKEN-004 | 点击"继续工作"延长会话 | 功能测试 | P0 | ADM-TOKEN-003 |
| TC-TOKEN-005 | 点击"退出登录"安全退出 | 功能测试 | P0 | ADM-TOKEN-003 |
| TC-TOKEN-006 | Token 过期自动跳转 | 功能测试 | P0 | ADM-TOKEN-001 |
| TC-TOKEN-007 | 页面切换警告保持显示 | 功能测试 | P1 | ADM-TOKEN-002 |
| TC-TOKEN-008 | 刷新页面重新检查 | 功能测试 | P1 | ADM-TOKEN-002 |
| TC-TOKEN-009 | 边界时间测试 | 边界测试 | P1 | ADM-TOKEN-001 |
| TC-TOKEN-010 | 多标签页独立监控 | 兼容性测试 | P2 | ADM-TOKEN-001 |

---

## 2. 详细测试用例

### TC-TOKEN-001: Token 监控启动测试

**对应需求**: ADM-TOKEN-001  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证用户登录后 Token 监控自动启动 |
| **前置条件** | 1. 用户未登录<br>2. 浏览器控制台打开 |
| **测试步骤** | 1. 访问 `/admin/login`<br>2. 输入正确的管理员账号密码<br>3. 点击登录按钮<br>4. 观察控制台输出 |
| **预期结果** | 1. 登录成功，跳转至 `/admin/dashboard`<br>2. 控制台输出: `[TokenMonitor] 启动 Token 监控`<br>3. 每 30 秒输出检查日志 |
| **测试数据** | 管理员账号: admin / 密码: 任意有效密码 |
| **通过标准** | 控制台显示监控启动日志 |

---

### TC-TOKEN-002: Token 即将过期警告显示

**对应需求**: ADM-TOKEN-001, ADM-TOKEN-002  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证 Token 即将过期时显示警告提示 |
| **前置条件** | 1. 用户已登录<br>2. Token 剩余有效期 ≤ 5 分钟<br>3. 可通过修改后端 `expiresIn` 为 `'6m'` 快速测试 |
| **测试步骤** | 1. 登录管理后台<br>2. 等待 Token 剩余时间 ≤ 5 分钟<br>3. 观察页面顶部 |
| **预期结果** | 1. 页面顶部显示红色警告提示框<br>2. 提示框包含:<br>   - 警告图标 ⚠️<br>   - 时钟图标 ⏱️ (带脉冲动画)<br>   - 标题: "登录即将过期"<br>   - 描述: "登录即将在 X分X秒 后过期，请保存您的工作"<br>   - 两个按钮: "我已保存，继续工作" 和 "立即退出登录" |
| **测试数据** | 模拟 Token 剩余 4 分 30 秒 |
| **通过标准** | 警告框正确显示，包含所有元素 |

---

### TC-TOKEN-003: 倒计时实时更新测试

**对应需求**: ADM-TOKEN-001  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证倒计时每 30 秒更新一次 |
| **前置条件** | 警告提示已显示 |
| **测试步骤** | 1. 记录当前显示的时间<br>2. 等待 30 秒<br>3. 观察时间显示变化 |
| **预期结果** | 1. 30 秒后时间显示更新<br>2. 时间减少约 30 秒<br>3. 格式保持 "X分X秒" |
| **测试数据** | 初始: "4分30秒" → 30秒后: "4分0秒" |
| **通过标准** | 时间每 30 秒更新，减少约 30 秒 |

---

### TC-TOKEN-004: 点击"继续工作"延长会话

**对应需求**: ADM-TOKEN-003  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证点击"继续工作"按钮延长会话 |
| **前置条件** | 1. 警告提示已显示<br>2. Token 未过期 |
| **测试步骤** | 1. 点击"我已保存，继续工作"按钮<br>2. 观察网络请求<br>3. 观察警告框状态 |
| **预期结果** | 1. 发起 GET `/admin/statistics` 请求<br>2. 请求头包含 `Authorization: Bearer <token>`<br>3. API 返回 200<br>4. 警告框关闭<br>5. 控制台输出: `[TokenMonitor] 重置警告状态` |
| **测试数据** | 有效 Token |
| **通过标准** | API 调用成功，警告框关闭，监控继续 |

---

### TC-TOKEN-005: 点击"退出登录"安全退出

**对应需求**: ADM-TOKEN-003  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证点击"退出登录"按钮安全退出 |
| **前置条件** | 警告提示已显示 |
| **测试步骤** | 1. 点击"立即退出登录"按钮<br>2. 观察页面跳转<br>3. 检查 localStorage |
| **预期结果** | 1. localStorage 中的 `accessToken` 被清除<br>2. localStorage 中的 `admin` 被清除<br>3. 页面跳转至 `/admin/login`<br>4. 控制台输出: `[TokenMonitor] 停止 Token 监控` |
| **测试数据** | 任意登录状态 |
| **通过标准** | Token 清除，跳转登录页 |

---

### TC-TOKEN-006: Token 过期自动跳转

**对应需求**: ADM-TOKEN-001  
**测试类型**: 功能测试  
**优先级**: P0

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证 Token 过期后自动跳转登录页 |
| **前置条件** | 1. 用户已登录<br>2. Token 即将过期（警告已显示） |
| **测试步骤** | 1. 不执行任何操作<br>2. 等待 Token 过期<br>3. 观察页面变化 |
| **预期结果** | 1. Token 过期后页面跳转至 `/admin/login?expired=true`<br>2. localStorage 中的 Token 被清除<br>3. 控制台输出跳转日志 |
| **测试数据** | 可通过修改后端 `expiresIn` 为 `'1m'` 快速测试 |
| **通过标准** | 自动跳转至登录页，URL 包含 `expired=true` |

---

### TC-TOKEN-007: 页面切换警告保持显示

**对应需求**: ADM-TOKEN-002  
**测试类型**: 功能测试  
**优先级**: P1

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证切换页面时警告框保持显示 |
| **前置条件** | 1. 警告提示已显示<br>2. 当前在 `/admin/dashboard` |
| **测试步骤** | 1. 点击侧边栏"小说管理"导航<br>2. 观察页面跳转后的警告框状态 |
| **预期结果** | 1. 页面跳转至 `/admin/novels`<br>2. 警告框仍然显示在页面顶部<br>3. 倒计时继续更新 |
| **测试数据** | 从 Dashboard 切换到 Novels 页面 |
| **通过标准** | 页面切换后警告框保持显示 |

---

### TC-TOKEN-008: 刷新页面重新检查

**对应需求**: ADM-TOKEN-002  
**测试类型**: 功能测试  
**优先级**: P1

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证刷新页面后重新检查 Token 状态 |
| **前置条件** | 1. 警告提示已显示<br>2. Token 仍有效（未过期） |
| **测试步骤** | 1. 按 F5 刷新页面<br>2. 观察警告框状态 |
| **预期结果** | 1. 页面重新加载<br>2. Token 监控重新启动<br>3. 如果 Token 仍满足警告条件，警告框重新显示 |
| **测试数据** | 刷新前 Token 剩余 3 分钟 |
| **通过标准** | 刷新后正确显示警告框 |

---

### TC-TOKEN-009: 边界时间测试

**对应需求**: ADM-TOKEN-001  
**测试类型**: 边界测试  
**优先级**: P1

| 场景 | 剩余时间 | 预期结果 |
|------|----------|----------|
| 正好 5 分钟 | 5:00 | 显示警告 |
| 略小于 5 分钟 | 4:59 | 显示警告 |
| 略大于 5 分钟 | 5:01 | 不显示警告 |
| 0 分钟 | 0:00 | 跳转登录页 |
| 负数 | -0:01 | 跳转登录页 |

**测试步骤**:
1. 修改后端 JWT `expiresIn` 参数模拟不同过期时间
2. 登录后观察警告显示时机

**通过标准**: 所有边界条件符合预期

---

### TC-TOKEN-010: 多标签页独立监控

**对应需求**: ADM-TOKEN-001  
**测试类型**: 兼容性测试  
**优先级**: P2

| 项目 | 内容 |
|------|------|
| **测试目的** | 验证多标签页各自独立监控 Token |
| **前置条件** | 用户已登录 |
| **测试步骤** | 1. 在标签页 A 打开 `/admin/dashboard`<br>2. 在标签页 B 打开 `/admin/novels`<br>3. 等待 Token 即将过期 |
| **预期结果** | 1. 标签页 A 显示警告框<br>2. 标签页 B 也显示警告框<br>3. 两个页面独立倒计时 |
| **测试数据** | 两个不同 Admin 页面 |
| **通过标准** | 多标签页都正确显示警告 |

---

## 3. 自动化测试脚本

### 3.1 Playwright 测试脚本

```typescript
// case/coding/admin/token-expiry-warning.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Token 过期提示功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录管理后台
    await page.goto('/admin/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/dashboard');
  });

  test('TC-TOKEN-001: Token 监控启动', async ({ page }) => {
    // 监听控制台日志
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // 等待监控启动
    await page.waitForTimeout(1000);
    
    // 验证日志
    const hasStartLog = logs.some(log => 
      log.includes('[TokenMonitor] 启动 Token 监控')
    );
    expect(hasStartLog).toBeTruthy();
  });

  test('TC-TOKEN-002: Token 即将过期警告显示', async ({ page }) => {
    // 模拟 Token 即将过期（通过修改 localStorage 中的 token）
    // 注意：实际测试需要后端配合或使用 mock
    
    // 等待警告框出现
    const alert = page.locator('[data-testid="token-expiry-alert"]');
    await expect(alert).toBeVisible();
    
    // 验证警告框内容
    await expect(alert).toContainText('登录即将过期');
    await expect(alert).toContainText('请保存您的工作');
    
    // 验证按钮
    await expect(alert.locator('button:has-text("我已保存，继续工作")')).toBeVisible();
    await expect(alert.locator('button:has-text("立即退出登录")')).toBeVisible();
  });

  test('TC-TOKEN-004: 点击继续工作延长会话', async ({ page }) => {
    // 等待警告框
    const alert = page.locator('[data-testid="token-expiry-alert"]');
    await expect(alert).toBeVisible();
    
    // 监听 API 请求
    const [response] = await Promise.all([
      page.waitForResponse(resp => 
        resp.url().includes('/admin/statistics') && resp.status() === 200
      ),
      alert.locator('button:has-text("我已保存，继续工作")').click()
    ]);
    
    expect(response.status()).toBe(200);
    
    // 验证警告框关闭
    await expect(alert).not.toBeVisible();
  });

  test('TC-TOKEN-005: 点击退出登录', async ({ page }) => {
    // 等待警告框
    const alert = page.locator('[data-testid="token-expiry-alert"]');
    await expect(alert).toBeVisible();
    
    // 点击退出
    await alert.locator('button:has-text("立即退出登录")').click();
    
    // 验证跳转
    await page.waitForURL('/admin/login');
    
    // 验证 Token 清除
    const token = await page.evaluate(() => 
      localStorage.getItem('accessToken')
    );
    expect(token).toBeNull();
  });
});
```

### 3.2 手动测试检查清单

```markdown
## 手动测试检查清单

### 环境准备
- [ ] 后端服务运行在 http://localhost:3001
- [ ] 前端服务运行在 http://localhost:3000
- [ ] 管理员账号可用

### 测试执行

#### 基础功能
- [ ] TC-TOKEN-001: 登录后控制台显示监控启动日志
- [ ] TC-TOKEN-002: Token 即将过期时显示警告框
- [ ] TC-TOKEN-003: 倒计时每 30 秒更新
- [ ] TC-TOKEN-004: 点击"继续工作"调用 API 并关闭警告
- [ ] TC-TOKEN-005: 点击"退出登录"清除 Token 并跳转
- [ ] TC-TOKEN-006: Token 过期自动跳转登录页

#### 边界和兼容性
- [ ] TC-TOKEN-007: 页面切换警告保持显示
- [ ] TC-TOKEN-008: 刷新页面重新检查
- [ ] TC-TOKEN-009: 边界时间测试（5分钟临界点）
- [ ] TC-TOKEN-010: 多标签页独立监控

### 测试结果
- 通过: ___
- 失败: ___
- 跳过: ___

### 测试人员
- 姓名: _____________
- 日期: _____________
- 签名: _____________
```

---

## 4. 测试数据准备

### 4.1 快速测试配置

修改后端 `admin.service.ts` 临时缩短 Token 过期时间：

```typescript
// 开发测试用（1分钟过期）
const token = this.jwtService.sign(
  { sub: admin.id, type: 'admin' },
  {
    secret: this.configService.get('JWT_SECRET'),
    expiresIn: '1m', // 临时改为 1 分钟
  },
);
```

### 4.2 Mock Token 生成

用于前端单元测试：

```typescript
// 生成一个 5 分钟后过期的 Token
function generateMockToken(expiresInMinutes: number = 5): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'admin-id',
    type: 'admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInMinutes * 60
  }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}
```

---

## 5. 变更记录

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|----------|------|
| v1.0 | 2026-04-19 | 初始版本 | AI Assistant |

---

## 6. 相关文档

- [Token 过期提示功能-细粒度需求](../../../docs/requirements/granular/admin/Token过期提示功能-细粒度需求.md)
- [Token 过期提示功能设计](../../../plan/02-系统设计/50-页面设计/65-Token过期提示设计.md)
