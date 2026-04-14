# NovelHub 审核队列状态 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 队列状态查询

### TC-API-REV-QUEUE-001: 获取审核队列统计

**接口信息**:
- **Method**: GET
- **URL**: `/api/admin/review/queue/stats`
- **Auth**: Required (Admin)

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "pending": 50,
    "processing": 10,
    "approved": 200,
    "rejected": 30,
    "averageWaitTime": 3600,
    "averageProcessTime": 300
  }
}
```

---

## 2. 队列管理

### TC-API-REV-QUEUE-010: 调整审核优先级

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/admin/review/queue/:id/priority`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "priority": "high"
}
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
