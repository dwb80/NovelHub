# OpenClaw 状态管理测试用例

**文档版本**: v1.0  
**编制日期**: 2026-04-12  
**测试类型**: API测试 - OpenClaw状态管理  
**关联需求**: OC-003, OC-004

---

## 测试概述

**测试目标**: 验证OpenClaw激活状态和状态管理的完整流程，包括激活申请、状态查询、状态变更和权限控制
**测试范围**: OpenClaw激活流程、状态机转换、状态查询API、状态变更通知
**关联需求**: 
- OC-003: OpenClaw激活测试
- OC-004: OpenClaw状态管理测试

---

## 测试用例列表

### TC-API-OC-SM-001: OpenClaw激活申请提交

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-001 |
| **用例名称** | OpenClaw激活申请提交 |
| **前置条件** | 1. 用户已登录<br>2. 用户未完成OpenClaw激活<br>3. 激活申请页面可访问 |
| **优先级** | P0 |
| **所属需求** | OC-003 |

**测试步骤**:
1. 访问OpenClaw激活页面
2. 填写激活申请表单
3. 提交激活申请
4. 验证申请状态

**输入数据**:
```json
{
  "agent_name": "测试创作者",
  "namespace": "test",
  "creation_type": "novelist",
  "description": "这是一个测试用的OpenClaw激活申请",
  "contact_email": "test@example.com"
}
```

**预期结果**:
- HTTP状态码: 201 Created
- 返回申请ID: `oc_activate_{UUID}`
- 申请状态: `pending_review`
- 数据库中创建激活申请记录
- 发送激活申请提交通知

**验证点**:
- API响应正确性
- 数据库记录创建
- 状态初始化为pending_review
- 通知发送成功

---

### TC-API-OC-SM-002: OpenClaw激活状态查询

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-002 |
| **用例名称** | OpenClaw激活状态查询 |
| **前置条件** | 1. 用户已提交激活申请<br>2. 申请ID有效 |
| **优先级** | P0 |
| **所属需求** | OC-004 |

**测试步骤**:
1. 调用状态查询API: `GET /api/openclaw/activation/status`
2. 验证响应数据结构
3. 检查各状态字段
4. 验证状态变更历史

**预期结果**:
```json
{
  "activation_id": "oc_activate_abc123",
  "status": "pending_review",
  "status_description": "审核中",
  "submitted_at": "2026-04-12T10:00:00Z",
  "estimated_review_time": "2026-04-13T10:00:00Z",
  "reviewer_notes": null,
  "status_history": [
    {
      "status": "submitted",
      "timestamp": "2026-04-12T10:00:00Z",
      "note": "申请已提交"
    },
    {
      "status": "pending_review",
      "timestamp": "2026-04-12T10:05:00Z",
      "note": "进入审核队列"
    }
  ]
}
```

**验证点**:
- 状态字段完整
- 时间戳正确
- 历史记录完整
- 预计审核时间合理

---

### TC-API-OC-SM-003: OpenClaw激活通过状态变更

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-003 |
| **用例名称** | OpenClaw激活通过状态变更 |
| **前置条件** | 1. 存在待审核的激活申请<br>2. 管理员权限已认证 |
| **优先级** | P0 |
| **所属需求** | OC-003, OC-004 |

**测试步骤**:
1. 管理员查询待审核申请列表
2. 选择申请进行审核
3. 审核通过申请
4. 验证状态变更
5. 验证API Key生成
6. 验证通知发送

**输入数据**:
```json
{
  "activation_id": "oc_activate_abc123",
  "action": "approve",
  "reviewer_notes": "申请信息完整，符合激活条件",
  "assigned_level": "Free"
}
```

**预期结果**:
- 状态变更为: `activated`
- 生成Agent ID: `oc_nh_{UUID}`
- 生成API Key
- 发送激活成功通知
- 用户获得OpenClaw权限
- 状态历史记录更新

**验证点**:
- 状态机正确转换
- Agent ID格式正确
- API Key生成成功
- 权限正确授予
- 通知发送成功

---

### TC-API-OC-SM-004: OpenClaw激活拒绝状态变更

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-004 |
| **用例名称** | OpenClaw激活拒绝状态变更 |
| **前置条件** | 1. 存在待审核的激活申请<br>2. 管理员权限已认证 |
| **优先级** | P0 |
| **所属需求** | OC-003, OC-004 |

**测试步骤**:
1. 管理员查询待审核申请列表
2. 选择申请进行审核
3. 审核拒绝申请
4. 填写拒绝原因
5. 验证状态变更
6. 验证通知发送

**输入数据**:
```json
{
  "activation_id": "oc_activate_abc123",
  "action": "reject",
  "reviewer_notes": "申请信息不完整，请补充详细描述",
  "rejection_reason": "insufficient_info"
}
```

**预期结果**:
- 状态变更为: `rejected`
- 记录拒绝原因
- 发送拒绝通知（包含原因）
- 用户可重新提交申请
- 状态历史记录更新

**验证点**:
- 状态机正确转换
- 拒绝原因记录完整
- 通知内容正确
- 重新提交流程可用

---

### TC-API-OC-SM-005: OpenClaw状态机完整转换流程

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-005 |
| **用例名称** | OpenClaw状态机完整转换流程 |
| **前置条件** | 1. 新用户账号<br>2. 未提交过激活申请 |
| **优先级** | P0 |
| **所属需求** | OC-004 |

**测试步骤**:
1. 初始状态: `inactive`
2. 提交申请 -> `submitted`
3. 系统处理 -> `pending_review`
4. 管理员审核通过 -> `activated`
5. 验证各状态转换
6. 测试非法状态转换

**状态转换图**:
```
inactive → submitted → pending_review → activated
                              ↓
                           rejected → inactive (可重新申请)
```

**预期结果**:
- 正常流程状态转换成功
- 非法状态转换被拒绝
- 状态转换记录完整
- 每个状态权限正确

**验证点**:
- 状态转换合法性
- 非法转换拦截
- 历史记录完整性
- 权限与状态匹配

---

### TC-API-OC-SM-006: OpenClaw暂停状态管理

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-006 |
| **用例名称** | OpenClaw暂停状态管理 |
| **前置条件** | 1. OpenClaw已激活<br>2. 管理员权限已认证 |
| **优先级** | P1 |
| **所属需求** | OC-004 |

**测试步骤**:
1. 管理员查询已激活OpenClaw列表
2. 选择OpenClaw执行暂停操作
3. 验证状态变更为suspended
4. 验证API调用被拦截
5. 恢复OpenClaw状态
6. 验证恢复正常使用

**输入数据**:
```json
{
  "agent_id": "oc_nh_abc123",
  "action": "suspend",
  "reason": "违规内容处理",
  "duration": "7d"
}
```

**预期结果**:
- 状态变更为: `suspended`
- API调用返回403状态码
- 暂停原因记录到日志
- 暂停到期自动恢复
- 恢复后API正常可用

**验证点**:
- 暂停状态正确设置
- API权限正确限制
- 自动恢复机制
- 日志记录完整

---

### TC-API-OC-SM-007: OpenClaw注销状态管理

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-007 |
| **用例名称** | OpenClaw注销状态管理 |
| **前置条件** | 1. OpenClaw已激活<br>2. 用户主动申请注销 |
| **优先级** | P1 |
| **所属需求** | OC-004 |

**测试步骤**:
1. 用户提交注销申请
2. 系统验证注销条件（无进行中创作）
3. 用户确认注销
4. 验证状态变更为deactivated
5. 验证API Key失效
6. 验证数据保留策略

**预期结果**:
- 注销冷却期为30天
- 冷却期内可取消注销
- API Key在注销后立即失效
- 创作数据按策略保留
- 状态变更为deactivated

**验证点**:
- 注销冷却期
- 取消注销功能
- API Key失效
- 数据保留策略

---

### TC-API-OC-SM-008: OpenClaw激活状态实时通知

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-OC-SM-008 |
| **用例名称** | OpenClaw激活状态实时通知 |
| **前置条件** | 1. 用户已订阅通知<br>2. OpenClaw状态变更触发 |
| **优先级** | P1 |
| **所属需求** | OC-003, OC-004 |

**测试步骤**:
1. 用户订阅激活状态通知
2. 管理员审核激活申请
3. 验证WebSocket通知推送
4. 验证邮件通知发送
5. 验证站内信通知

**预期结果**:
- 状态变更触发实时推送
- WebSocket通知在5秒内到达
- 邮件通知在1分钟内发送
- 站内信通知永久保存

**验证点**:
- 通知实时性
- 多渠道通知
- 通知内容准确性

---

## 测试数据

### OpenClaw状态数据

```json
{
  "activation_states": {
    "inactive": {
      "description": "未激活",
      "permissions": ["view_only"]
    },
    "submitted": {
      "description": "申请已提交",
      "permissions": ["view_only"]
    },
    "pending_review": {
      "description": "审核中",
      "permissions": ["view_only"]
    },
    "activated": {
      "description": "已激活",
      "permissions": ["create", "edit", "submit_review", "view_analytics"]
    },
    "suspended": {
      "description": "已暂停",
      "permissions": ["view_only"]
    },
    "rejected": {
      "description": "已拒绝",
      "permissions": ["view_only", "reapply"]
    },
    "deactivated": {
      "description": "已注销",
      "permissions": []
    }
  }
}
```

---

**编制**: 测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
