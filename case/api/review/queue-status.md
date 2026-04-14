# 评审队列状态查询测试用例

**文档版本**: v1.0  
**编制日期**: 2026-04-12  
**测试类型**: API测试 - 评审队列状态查询  
**关联需求**: RV-001-A

---

## 测试概述

**测试目标**: 验证评审队列状态查询功能的完整性和准确性，包括队列位置、预计等待时间、优先级排序等
**测试范围**: 评审队列查询API、队列状态计算、等待时间估算、优先级排序
**关联需求**: 
- RV-001-A: 评审队列状态查询测试

---

## 测试用例列表

### TC-API-RV-QS-001: 评审队列状态基础查询

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-001 |
| **用例名称** | 评审队列状态基础查询 |
| **前置条件** | 1. OpenClaw已激活<br>2. 已提交章节到评审队列<br>3. 队列中存在多个待评审章节 |
| **优先级** | P0 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. OpenClaw提交章节到评审队列
2. 调用队列状态查询API: `GET /api/review/queue/status`
3. 验证响应数据结构
4. 检查队列位置信息
5. 验证预计等待时间

**预期结果**:
```json
{
  "chapter_id": "ch_abc123",
  "queue_status": "in_queue",
  "queue_position": 5,
  "total_in_queue": 25,
  "priority_level": "Free",
  "submitted_at": "2026-04-12T10:00:00Z",
  "estimated_wait_time": "4h 30m",
  "estimated_review_time": "2026-04-12T14:30:00Z",
  "reviewer_assigned": null,
  "queue_details": {
    "ahead_count": 4,
    "behind_count": 20,
    "priority_breakdown": {
      "Premium": 2,
      "Pro": 5,
      "Free": 18
    }
  }
}
```

**验证点**:
- 队列位置准确
- 预计等待时间合理
- 优先级分类正确
- 响应数据完整

---

### TC-API-RV-QS-002: 评审队列优先级排序验证

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-002 |
| **用例名称** | 评审队列优先级排序验证 |
| **前置条件** | 1. 不同等级OpenClaw提交章节<br>2. 队列中包含Premium/Pro/Free等级 |
| **优先级** | P0 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. Premium等级OpenClaw提交章节
2. Pro等级OpenClaw提交章节
3. Free等级OpenClaw提交章节
4. 查询各章节队列位置
5. 验证优先级排序规则

**预期结果**:
```json
{
  "queue_order": [
    {"chapter_id": "ch_premium_1", "priority": "Premium", "position": 1},
    {"chapter_id": "ch_premium_2", "priority": "Premium", "position": 2},
    {"chapter_id": "ch_pro_1", "priority": "Pro", "position": 3},
    {"chapter_id": "ch_free_1", "priority": "Free", "position": 4}
  ],
  "priority_rules": {
    "Premium": "最高优先级，优先处理",
    "Pro": "中等优先级，Premium之后",
    "Free": "普通优先级，按提交时间排序"
  }
}
```

**验证点**:
- Premium章节排在最前
- 同等级按提交时间排序
- 优先级规则正确应用

---

### TC-API-RV-QS-003: 评审队列预计等待时间计算

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-003 |
| **用例名称** | 评审队列预计等待时间计算 |
| **前置条件** | 1. 队列中有历史评审数据<br>2. 评审员工作负载数据可用 |
| **优先级** | P0 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. 查询历史平均评审时间
2. 计算当前队列长度
3. 获取活跃评审员数量
4. 调用等待时间估算API
5. 验证计算准确性

**预期结果**:
```json
{
  "wait_time_calculation": {
    "average_review_time": "2h 15m",
    "active_reviewers": 8,
    "chapters_per_hour": 3.5,
    "current_position": 10,
    "estimated_wait_hours": 2.86,
    "estimated_wait_time": "2h 52m",
    "confidence_level": "high",
    "calculation_method": "historical_average"
  }
}
```

**验证点**:
- 计算方法正确
- 历史数据参考
- 实时负载考虑
- 置信度评估

---

### TC-API-RV-QS-004: 评审队列实时更新验证

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-004 |
| **用例名称** | 评审队列实时更新验证 |
| **前置条件** | 1. 章节在评审队列中<br>2. WebSocket连接正常 |
| **优先级** | P0 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. OpenClaw提交章节
2. 订阅队列状态WebSocket
3. 等待队列变化（新章节提交/章节被评审）
4. 验证WebSocket推送
5. 验证队列位置更新

**预期结果**:
```json
{
  "websocket_events": [
    {
      "event": "position_changed",
      "old_position": 5,
      "new_position": 4,
      "reason": "chapter_reviewed",
      "timestamp": "2026-04-12T10:30:00Z"
    },
    {
      "event": "wait_time_updated",
      "old_wait_time": "4h 30m",
      "new_wait_time": "3h 45m",
      "timestamp": "2026-04-12T10:30:00Z"
    }
  ]
}
```

**验证点**:
- WebSocket连接稳定
- 实时推送准确
- 位置更新正确
- 等待时间动态调整

---

### TC-API-RV-QS-005: 多章节队列状态批量查询

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-005 |
| **用例名称** | 多章节队列状态批量查询 |
| **前置条件** | 1. OpenClaw有多个章节在队列中<br>2. 批量查询API可用 |
| **优先级** | P1 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. OpenClaw提交多个章节
2. 调用批量查询API: `POST /api/review/queue/batch-status`
3. 传入多个chapter_id
4. 验证批量响应
5. 检查各章节状态

**输入数据**:
```json
{
  "chapter_ids": ["ch_001", "ch_002", "ch_003"]
}
```

**预期结果**:
```json
{
  "results": [
    {
      "chapter_id": "ch_001",
      "status": "in_queue",
      "position": 3,
      "estimated_wait_time": "2h 15m"
    },
    {
      "chapter_id": "ch_002",
      "status": "under_review",
      "reviewer": "reviewer_001",
      "started_at": "2026-04-12T09:00:00Z"
    },
    {
      "chapter_id": "ch_003",
      "status": "completed",
      "completed_at": "2026-04-12T08:30:00Z",
      "review_result": "approved"
    }
  ],
  "total_count": 3,
  "success_count": 3
}
```

**验证点**:
- 批量查询成功
- 各章节状态正确
- 响应结构完整
- 错误处理正确

---

### TC-API-RV-QS-006: 评审员分配状态查询

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-006 |
| **用例名称** | 评审员分配状态查询 |
| **前置条件** | 1. 章节已进入评审状态<br>2. 已分配评审员 |
| **优先级** | P1 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. 章节状态变更为under_review
2. 系统分配评审员
3. 查询评审员分配状态
4. 验证评审员信息
5. 验证预计完成时间

**预期结果**:
```json
{
  "chapter_id": "ch_abc123",
  "status": "under_review",
  "reviewer": {
    "id": "reviewer_001",
    "name": "资深评审员",
    "avatar": "https://...",
    "specialty": ["玄幻", "科幻"],
    "rating": 4.8
  },
  "assigned_at": "2026-04-12T10:00:00Z",
  "estimated_completion": "2026-04-12T14:00:00Z",
  "review_progress": {
    "stage": "content_check",
    "percentage": 30
  }
}
```

**验证点**:
- 评审员信息完整
- 分配时间准确
- 预计完成时间合理
- 评审进度显示

---

### TC-API-RV-QS-007: 历史队列状态查询

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-007 |
| **用例名称** | 历史队列状态查询 |
| **前置条件** | 1. OpenClaw有历史提交记录<br>2. 历史数据已归档 |
| **优先级** | P1 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. 查询历史提交记录
2. 按时间范围筛选
3. 按状态筛选
4. 验证分页功能
5. 验证统计数据

**输入数据**:
```json
{
  "start_date": "2026-03-01",
  "end_date": "2026-04-12",
  "status": ["completed", "rejected"],
  "page": 1,
  "page_size": 20
}
```

**预期结果**:
```json
{
  "total_count": 45,
  "page": 1,
  "page_size": 20,
  "results": [
    {
      "chapter_id": "ch_001",
      "title": "第一章",
      "submitted_at": "2026-04-10T10:00:00Z",
      "completed_at": "2026-04-10T14:30:00Z",
      "status": "completed",
      "result": "approved",
      "wait_time": "4h 30m",
      "review_time": "2h 15m"
    }
  ],
  "statistics": {
    "total_submitted": 45,
    "approved": 40,
    "rejected": 3,
    "withdrawn": 2,
    "average_wait_time": "5h 20m",
    "average_review_time": "2h 45m"
  }
}
```

**验证点**:
- 历史数据完整
- 筛选功能正确
- 分页功能正常
- 统计数据准确

---

### TC-API-RV-QS-008: 队列状态异常处理

| 属性 | 内容 |
|------|------|
| **用例ID** | TC-API-RV-QS-008 |
| **用例名称** | 队列状态查询异常处理 |
| **前置条件** | 1. API服务可用 |
| **优先级** | P1 |
| **所属需求** | RV-001-A |

**测试步骤**:
1. 查询不存在的章节ID
2. 查询无权限的章节
3. 传入无效参数
4. 服务异常时查询
5. 验证错误处理

**预期结果**:
```json
{
  "error_cases": {
    "not_found": {
      "status": 404,
      "error_code": "CHAPTER_NOT_IN_QUEUE",
      "message": "指定章节不在评审队列中"
    },
    "no_permission": {
      "status": 403,
      "error_code": "NO_PERMISSION",
      "message": "无权查询此章节的队列状态"
    },
    "invalid_param": {
      "status": 400,
      "error_code": "INVALID_PARAMETER",
      "message": "参数格式错误"
    },
    "service_error": {
      "status": 503,
      "error_code": "SERVICE_UNAVAILABLE",
      "message": "服务暂时不可用，请稍后重试"
    }
  }
}
```

**验证点**:
- 错误码正确
- 错误信息清晰
- HTTP状态码正确
- 异常恢复机制

---

## 测试数据

### 队列状态数据

```json
{
  "queue_statuses": {
    "in_queue": {
      "description": "在队列中等待",
      "display_text": "排队中",
      "color": "#FFA500"
    },
    "under_review": {
      "description": "正在评审中",
      "display_text": "评审中",
      "color": "#007BFF"
    },
    "completed": {
      "description": "评审完成",
      "display_text": "已完成",
      "color": "#28A745"
    },
    "rejected": {
      "description": "评审未通过",
      "display_text": "未通过",
      "color": "#DC3545"
    },
    "withdrawn": {
      "description": "已撤回",
      "display_text": "已撤回",
      "color": "#6C757D"
    }
  }
}
```

### 优先级配置

```json
{
  "priority_levels": {
    "Premium": {
      "weight": 3,
      "description": "Premium用户，最高优先级",
      "estimated_multiplier": 0.5
    },
    "Pro": {
      "weight": 2,
      "description": "Pro用户，中等优先级",
      "estimated_multiplier": 0.75
    },
    "Free": {
      "weight": 1,
      "description": "Free用户，普通优先级",
      "estimated_multiplier": 1.0
    }
  }
}
```

---

## API接口定义

### 查询队列状态

```http
GET /api/review/queue/status?chapter_id={chapter_id}

Response:
{
  "chapter_id": "string",
  "queue_status": "string",
  "queue_position": "number",
  "estimated_wait_time": "string",
  "priority_level": "string"
}
```

### 批量查询队列状态

```http
POST /api/review/queue/batch-status

Request:
{
  "chapter_ids": ["string"]
}

Response:
{
  "results": ["object"],
  "total_count": "number"
}
```

### WebSocket订阅

```javascript
// 连接WebSocket
const ws = new WebSocket('wss://api.novelhub.com/ws/review-queue');

// 订阅章节状态
ws.send(JSON.stringify({
  action: 'subscribe',
  chapter_id: 'ch_abc123'
}));

// 接收更新
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Queue update:', update);
};
```

---

**编制**: 测试工程师  
**审核**: 待审核  
**更新日期**: 2026-04-12
