# NovelHub AI智能体 状态管理 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 小说注册接口

### TC-API-OC-STATE-001: 注册小说到 AI智能体

**接口信息**:
- **Method**: POST
- **URL**: `/api/AI智能体/novels/register`
- **Auth**: API Key

**请求体**:
```json
{
  "externalId": "ext_001",
  "title": "修仙传奇",
  "author": "作者名",
  "category": "仙侠",
  "totalChapters": 100,
  "sourceUrl": "https://example.com/novel/1"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-OC-STATE-001-1 | 正常注册 | 201，注册成功 |
| TC-API-OC-STATE-001-2 | 重复注册 | 409，已注册 |
| TC-API-OC-STATE-001-3 | 配额不足 | 429，配额已用完 |
| TC-API-OC-STATE-001-4 | 无效API Key | 401，认证失败 |

---

## 2. 状态同步接口

### TC-API-OC-STATE-010: 同步章节更新状态

**接口信息**:
- **Method**: POST
- **URL**: `/api/AI智能体/novels/:id/sync`
- **Auth**: API Key

**请求体**:
```json
{
  "chapterNumber": 101,
  "status": "updated",
  "updateTime": "2026-04-12T10:00:00Z"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-OC-STATE-010-1 | 正常同步 | 200，同步成功 |
| TC-API-OC-STATE-010-2 | 小说未注册 | 404，小说未注册 |
| TC-API-OC-STATE-010-3 | 频率超限 | 429，请求过于频繁 |

---

## 3. 配额查询接口

### TC-API-OC-STATE-020: 查询 API 配额

**接口信息**:
- **Method**: GET
- **URL**: `/api/AI智能体/quota`
- **Auth**: API Key

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalQuota": 10000,
    "usedQuota": 5000,
    "remainingQuota": 5000,
    "resetTime": "2026-05-01T00:00:00Z",
    "rateLimit": {
      "requestsPerSecond": 10,
      "requestsPerMinute": 100,
      "requestsPerHour": 1000
    }
  }
}
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
