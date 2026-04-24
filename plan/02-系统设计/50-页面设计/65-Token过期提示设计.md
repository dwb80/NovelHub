# Token 过期提示功能设计文档

**最后更新**: 2026-04-19  
**设计版本**: v1.0  
**相关模块**: Admin 管理后台 / 认证模块

---

## 1. 设计概述

### 1.1 设计目标
为管理后台提供 Token 即将过期的预警机制，避免用户因 Token 过期而丢失未保存的工作。

### 1.2 设计原则
- **及时性**: 提前 5 分钟预警，给用户充足时间
- **非侵入性**: 警告提示不阻塞用户操作
- **可操作性**: 提供明确的操作选项
- **可视化**: 实时显示倒计时，增强紧迫感

---

## 2. 架构设计

### 2.1 组件架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Layout                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Token Expiry Warning Alert                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │ │
│  │  │   Icon      │  │   Message   │  │  Buttons    │     │ │
│  │  │ ⚠️ + ⏱️     │  │ 倒计时文本   │  │ [继续][退出] │     │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │ │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Page Content                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Token Monitor Service                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ JWT Parser  │  │  Scheduler  │  │    Event Emitter        │ │
│  │ 解析 Token   │  │ 定时检查    │  │  发送事件通知            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  登录成功  │────▶│ 解析 JWT     │────▶│ 启动监控定时器 │────▶│ 定期检查  │
└──────────┘     │ 获取 exp     │     │ (30s 间隔)   │     └────┬─────┘
                 └──────────────┘     └──────────────┘          │
                                                                  │
                              ┌───────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  检查剩余时间     │
                    │  timeRemaining  │
                    │  = exp - now    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌─────────┐    ┌─────────┐    ┌─────────┐
        │ > 5min  │    | = 5min  │    | < 5min  │
        │ 无操作   │    | 触发警告 │    | 触发警告 │
        └─────────┘    └────┬────┘    └────┬────┘
                            │              │
                            └──────┬───────┘
                                   ▼
                    ┌─────────────────────────┐
                    │  emit: auth:token-expiring│
                    │  显示警告提示框            │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌──────────┐      ┌──────────┐      ┌──────────┐
        │ 用户点击   │      │ 用户点击   │      │ Token过期 │
        │ "继续工作" │      │ "退出登录" │      │          │
        └────┬─────┘      └────┬─────┘      └────┬─────┘
             │                 │                 │
             ▼                 ▼                 ▼
        ┌──────────┐      ┌──────────┐      ┌──────────┐
        │ 验证 Token│      │ 清除状态  │      │ 跳转登录页 │
        │ 重置警告  │      │ 跳转登录  │      │          │
        └──────────┘      └──────────┘      └──────────┘
```

---

## 3. 详细设计

### 3.1 TokenMonitor 类设计

```typescript
class TokenMonitor {
  // 配置常量
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5分钟
  private readonly CHECK_INTERVAL = 30 * 1000;        // 30秒
  
  // 状态
  private checkTimer: NodeJS.Timeout | null = null;
  private hasWarned = false;
  
  // 核心方法
  parseToken(token: string): TokenPayload | null;
  getTokenStatus(token?: string): TokenStatus;
  formatTimeRemaining(ms: number): string;
  startMonitoring(): void;
  stopMonitoring(): void;
  resetWarning(): void;
  
  // 事件
  // auth:token-expiring - Token 即将过期
  // auth:token-expiring-update - 更新倒计时
  // auth:token-expired - Token 已过期
}
```

### 3.2 状态流转

```
                    ┌─────────────┐
                    │   初始状态   │
                    │  (未监控)   │
                    └──────┬──────┘
                           │ startMonitoring()
                           ▼
                    ┌─────────────┐
         ┌─────────│   监控中    │◀────────┐
         │         │ (定时检查)   │         │
         │         └──────┬──────┘         │
         │                │                │
         │                │ 检查间隔 30s   │
         │                ▼                │
         │         ┌─────────────┐         │
         │    ┌────│  检查状态   │────┐    │
         │    │    └─────────────┘    │    │
         │    │                       │    │
         ▼    ▼                       ▼    ▼
   ┌──────────┐                 ┌──────────┐
   │ > 5min   │                 │ <= 5min  │
   │ 继续监控  │                 │ 触发警告  │
   └──────────┘                 └────┬─────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  警告状态   │
                              │ (显示提示)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌────────────┐         ┌────────────┐         ┌────────────┐
       │ 点击"继续"  │         │ 点击"退出"  │         │ Token过期  │
       │ 验证成功   │         │ 清除状态   │         │           │
       └─────┬──────┘         └─────┬──────┘         └─────┬──────┘
             │                      │                      │
             ▼                      ▼                      ▼
       ┌────────────┐         ┌────────────┐         ┌────────────┐
       │ 重置警告   │         │ 停止监控   │         │ 停止监控   │
       │ 返回监控中  │────────▶│ 跳转登录   │         │ 跳转登录   │
       └────────────┘         └────────────┘         └────────────┘
```

---

## 4. UI 设计

### 4.1 警告提示框布局

```
┌─────────────────────────────────────────────────────────────────┐
│  z-index: 50                                                    │
│  position: fixed                                                │
│  top: 0                                                         │
│  left: 0                                                        │
│  right: 0                                                       │
│  padding: 1rem                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  max-width: 672px (2xl)                                 │  │
│   │  margin: 0 auto                                         │  │
│   │  Alert variant="destructive"                            │  │
│   │  shadow-lg + border-2                                   │  │
│   │                                                         │  │
│   │  ┌─────┐  ┌─────────────────────────────────────────┐  │  │
│   │  │ ⚠️  │  │  AlertTitle: 登录即将过期               │  │  │
│   │  │     │  │  ┌─────┐  (ClockIcon + animate-pulse)   │  │  │
│   │  └─────┘  └─────────────────────────────────────────┘  │  │
│   │                                                         │  │
│   │  AlertDescription:                                      │  │
│   │  ┌─────────────────────────────────────────────────┐   │  │
│   │  │ 登录即将在 4分30秒后过期，请保存您的工作          │   │  │
│   │  │                                                 │   │  │
│   │  │ 请尽快保存您的工作，然后重新登录以继续操作。      │   │  │
│   │  │                                                 │   │  │
│   │  │ ┌────────────────┐  ┌────────────────┐         │   │  │
│   │  │ │ 我已保存，继续  │  │ 立即退出登录   │         │   │  │
│   │  │ │ 工作 (primary) │  │ (outline)      │         │   │  │
│   │  │ └────────────────┘  └────────────────┘         │   │  │
│   │  └─────────────────────────────────────────────────┘   │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 样式规范

| 元素 | 样式 | 说明 |
|------|------|------|
| 警告框容器 | `fixed top-0 left-0 right-0 z-50 p-4` | 固定在顶部 |
| 警告框 | `max-w-2xl mx-auto shadow-lg border-2` | 最大宽度 672px |
| 图标 | `AlertTriangle h-5 w-5` | 警告图标 |
| 时钟图标 | `Clock h-4 w-4 animate-pulse` | 带脉冲动画 |
| 主按钮 | `bg-primary hover:bg-primary/90` | 实心样式 |
| 次按钮 | `variant="outline"` | 边框样式 |

### 4.3 动画效果

```css
/* 时钟图标脉冲动画 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 警告框出现动画 */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## 5. 事件设计

### 5.1 事件类型

```typescript
// 事件总线扩展
type AppEventType = 
  // ... 原有事件
  | 'auth:token-expiring'        // Token 即将过期
  | 'auth:token-expiring-update' // 更新剩余时间
  | 'auth:token-expired';        // Token 已过期
```

### 5.2 事件数据格式

```typescript
// auth:token-expiring
interface TokenExpiringEvent {
  message: string;        // "登录即将在 4分30秒后过期，请保存您的工作"
  timeRemaining: number;  // 270000 (毫秒)
  expiresAt: Date;        // 过期时间
}

// auth:token-expiring-update
interface TokenExpiringUpdateEvent {
  timeRemaining: number;  // 240000 (毫秒)
  formattedTime: string;  // "4分0秒"
}

// auth:token-expired
interface TokenExpiredEvent {
  message: string;        // "登录已过期，请重新登录"
}
```

---

## 6. 接口设计

### 6.1 内部接口

```typescript
// TokenMonitor 公共接口
interface ITokenMonitor {
  // 解析 JWT Token
  parseToken(token: string): TokenPayload | null;
  
  // 获取 Token 状态
  getTokenStatus(token?: string): TokenStatus;
  
  // 格式化时间
  formatTimeRemaining(ms: number): string;
  
  // 启动/停止监控
  startMonitoring(): void;
  stopMonitoring(): void;
  
  // 重置警告
  resetWarning(): void;
}

// Token 状态
interface TokenStatus {
  isValid: boolean;       // 是否有效
  expiresAt: Date | null; // 过期时间
  timeRemaining: number;  // 剩余毫秒
  shouldWarn: boolean;    // 是否应该警告
}
```

### 6.2 API 调用

```typescript
// 延长会话时调用
GET /admin/statistics

// 请求头
Authorization: Bearer <token>

// 响应成功 (200)
{
  readers: { total: number; newToday: number; };
  claws: { total: number; authors: number; reviewers: number; };
  novels: { total: number; pendingReview: number; };
  reviews: { pending: number; completedToday: number; };
}

// 响应失败 (401) - Token 已过期
{
  message: "未授权"
}
```

---

## 7. 异常处理

### 7.1 异常情况表

| 异常情况 | 处理方式 | 用户反馈 |
|----------|----------|----------|
| Token 解析失败 | 停止监控，视为无效 | 无（等待下次请求跳转） |
| 网络异常 | 保持警告框显示 | 提示"网络异常，请检查连接" |
| Token 验证失败 | 跳转登录页 | 跳转至 `/admin/login?expired=true` |
| 用户同时多标签页 | 各页面独立监控 | 各页面都显示警告 |

### 7.2 错误边界

```typescript
// 监控循环中的错误捕获
private checkToken() {
  try {
    const status = this.getTokenStatus();
    // ... 处理逻辑
  } catch (error) {
    console.error('[TokenMonitor] 检查 Token 失败:', error);
    // 不中断监控，下次继续检查
  }
}
```

---

## 8. 性能考虑

### 8.1 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 检查间隔 | 30 秒 | 平衡实时性和性能 |
| 内存占用 | < 1MB | 仅存储定时器和状态 |
| CPU 占用 | 可忽略 | 简单的数学计算 |

### 8.2 优化策略

1. **节流检查**: 30 秒间隔避免频繁计算
2. **懒加载**: 仅在 Admin 页面启动监控
3. **及时清理**: 组件卸载时停止监控
4. **事件驱动**: 使用事件总线避免轮询 UI

---

## 9. 安全考虑

### 9.1 安全措施

1. **Token 不暴露**: 仅在前端内存中解析，不发送给第三方
2. **时间戳验证**: 使用服务器签发时间，不依赖客户端时间
3. **安全跳转**: 过期后清除所有敏感数据再跳转

### 9.2 防护机制

```typescript
// 防止 XSS 攻击的 Token 解析
parseToken(token: string): TokenPayload | null {
  try {
    // 仅解析，不执行任何代码
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
```

---

## 10. 变更记录

| 版本 | 日期 | 变更内容 | AI智能体作家 |
|------|------|----------|------|
| v1.0 | 2026-04-19 | 初始版本 | AI Assistant |

---

## 11. 相关文档

- [Token 过期提示功能-细粒度需求](../../../docs/requirements/granular/admin/Token过期提示功能-细粒度需求.md)
- [管理后台模块设计](./54-管理后台设计.md)
- [认证模块设计](../../29-认证模块设计.md)
