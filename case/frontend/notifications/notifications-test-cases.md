# 通知中心模块测试用例

## 1. 需求理解

### 1.1 功能概述
通知中心展示用户的系统通知和消息，包括更新提醒、评论回复、系统公告等。

### 1.2 涉及页面
- 通知中心: `/notifications`

### 1.3 关键功能点
1. 查看通知列表
2. 标记已读
3. 删除通知
4. 通知分类筛选

---

## 2. 测试用例

| 测试用例ID | 对应需求 | 测试描述 | 测试类型 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|-----------|---------|---------|---------|---------|---------|---------|--------|
| NOTIF-001 | US-NOTIF-001-权限检查 | 未登录被重定向 | E2E | 服务已启动 | 1. 访问 `/notifications` | 重定向到登录页 | P0 |
| NOTIF-002 | US-NOTIF-002-列表加载 | 通知列表加载 | E2E | 用户已登录 | 1. 访问 `/notifications` | 显示通知列表 | P0 |
| NOTIF-003 | US-NOTIF-003-标记已读 | 标记通知为已读 | E2E | 有未读通知 | 1. 点击标记已读 | 通知状态变为已读 | P1 |
| NOTIF-004 | US-NOTIF-004-删除通知 | 删除通知 | E2E | 有通知 | 1. 点击删除 | 通知从列表移除 | P1 |

---

## 3. 测试代码

```typescript
// case/coding/notifications/notifications.spec.ts
import { test, expect } from '@playwright/test';

test.describe('通知中心', () => {
  test('NOTIF-001: 未登录被重定向', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/.*login/);
  });
});
```
