# NovelHub 章节生命周期 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 章节创建接口

### TC-API-CH-001: 创建章节

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:novelId/chapters`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "title": "第一章：初入仙门",
  "content": "章节内容...",
  "order": 1,
  "isVip": false,
  "wordCount": 3000
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-001-1 | 正常创建 | 201，创建成功 |
| TC-API-CH-001-2 | 标题重复 | 409，标题已存在 |
| TC-API-CH-001-3 | 内容过短(<100) | 400，内容过短 |
| TC-API-CH-001-4 | 内容过长(>50000) | 400，内容过长 |
| TC-API-CH-001-5 | 非作者创建 | 403，无权操作 |
| TC-API-CH-001-6 | 小说不存在 | 404，小说不存在 |
| TC-API-CH-001-7 | 小说已完结 | 422，无法添加章节 |

---

### TC-API-CH-002: 批量创建章节

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:novelId/chapters/batch`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "chapters": [
    {
      "title": "第一章",
      "content": "内容...",
      "order": 1
    },
    {
      "title": "第二章",
      "content": "内容...",
      "order": 2
    }
  ]
}
```

---

## 2. 章节查询接口

### TC-API-CH-010: 获取章节列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/novels/:novelId/chapters`
- **Auth**: Optional

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 50,
  "sort": "order",
  "order": "asc"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "ch_001",
      "title": "第一章：初入仙门",
      "order": 1,
      "isVip": false,
      "wordCount": 3000,
      "status": "published",
      "publishedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "total": 100
    }
  }
}
```

---

### TC-API-CH-011: 获取章节详情

**接口信息**:
- **Method**: GET
- **URL**: `/api/chapters/:id`
- **Auth**: Optional (VIP章节需要登录购买)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-011-1 | 获取免费章节 | 200，返回内容 |
| TC-API-CH-011-2 | 获取已购VIP章节 | 200，返回内容 |
| TC-API-CH-011-3 | 获取未购VIP章节(已登录) | 403，需要购买 |
| TC-API-CH-011-4 | 获取未购VIP章节(未登录) | 401，需要登录 |
| TC-API-CH-011-5 | 章节不存在 | 404，章节不存在 |
| TC-API-CH-011-6 | 章节未发布 | 403，章节未发布 |

---

## 3. 章节更新接口

### TC-API-CH-020: 更新章节

**接口信息**:
- **Method**: PUT
- **URL**: `/api/chapters/:id`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "title": "第一章：初入仙门（修订）",
  "content": "修订后的内容...",
  "isVip": true,
  "price": 10
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-020-1 | 正常更新 | 200，更新成功 |
| TC-API-CH-020-2 | 更新已发布章节 | 200，创建修订版本 |
| TC-API-CH-020-3 | 非作者更新 | 403，无权操作 |
| TC-API-CH-020-4 | 免费章节设为VIP | 400，状态冲突 |
| TC-API-CH-020-5 | 已购章节修改价格 | 400，无法修改 |

---

### TC-API-CH-021: 部分更新章节

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/chapters/:id`
- **Auth**: Required (Author)

---

## 4. 章节发布接口

### TC-API-CH-030: 发布章节

**接口信息**:
- **Method**: POST
- **URL**: `/api/chapters/:id/publish`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "scheduledAt": null
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-030-1 | 立即发布 | 200，发布成功 |
| TC-API-CH-030-2 | 定时发布 | 200，定时成功 |
| TC-API-CH-030-3 | 上一章未发布 | 422，先发布前置章节 |
| TC-API-CH-030-4 | 非作者发布 | 403，无权操作 |
| TC-API-CH-030-5 | 已发布章节 | 409，已发布 |

---

### TC-API-CH-031: 批量发布

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:novelId/chapters/publish`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "chapterIds": ["ch_001", "ch_002", "ch_003"]
}
```

---

## 5. 章节删除接口

### TC-API-CH-040: 删除章节

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/chapters/:id`
- **Auth**: Required (Author/Admin)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-040-1 | 删除草稿章节 | 204，删除成功 |
| TC-API-CH-040-2 | 删除已发布章节(无购买) | 204，删除成功 |
| TC-API-CH-040-3 | 删除已购买章节 | 400，已有购买记录 |
| TC-API-CH-040-4 | 非作者删除 | 403，无权操作 |
| TC-API-CH-040-5 | 管理员删除 | 204，删除成功 |

---

## 6. 章节排序接口

### TC-API-CH-050: 调整章节顺序

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/novels/:novelId/chapters/reorder`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "chapterId": "ch_001",
  "newOrder": 5
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CH-050-1 | 正常调整 | 200，调整成功 |
| TC-API-CH-050-2 | 调整后顺序冲突 | 409，序号冲突 |
| TC-API-CH-050-3 | 非作者调整 | 403，无权操作 |

---

**编制**: 测试团队  
**更新**: 2026-04-12
