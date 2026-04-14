# NovelHub 书架管理 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 书架查询接口

### TC-API-BS-001: 获取用户书架列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/bookshelf`
- **Auth**: Required

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "category": "reading",
  "sort": "lastRead",
  "order": "desc"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-001-1 | 正常获取书架 | 200，返回书架列表 |
| TC-API-BS-001-2 | 书架为空 | 200，返回空列表 |
| TC-API-BS-001-3 | 未登录访问 | 401，需要登录 |
| TC-API-BS-001-4 | 按分类过滤 | 200，返回分类内小说 |
| TC-API-BS-001-5 | 排序测试 | 200，按指定字段排序 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "bs_item_001",
      "novel": {
        "id": "nv_001",
        "title": "修仙传奇",
        "cover": "https://example.com/cover.jpg",
        "author": {
          "id": "usr_002",
          "username": "author1"
        },
        "lastChapter": {
          "id": "ch_100",
          "title": "第一百章",
          "updatedAt": "2026-04-12T10:00:00Z"
        }
      },
      "readingProgress": {
        "chapterId": "ch_50",
        "chapterTitle": "第五十章",
        "position": 1500,
        "percent": 45.5,
        "updatedAt": "2026-04-12T09:00:00Z"
      },
      "category": "reading",
      "isFavorite": true,
      "addedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 50
    }
  }
}
```

---

### TC-API-BS-002: 获取书架统计

**接口信息**:
- **Method**: GET
- **URL**: `/api/bookshelf/stats`
- **Auth**: Required

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "reading": 10,
    "completed": 30,
    "dropped": 5,
    "favorites": 15,
    "totalWordsRead": 5000000,
    "categories": [
      { "name": "仙侠", "count": 15 },
      { "name": "都市", "count": 10 }
    ]
  }
}
```

---

## 2. 书架操作接口

### TC-API-BS-010: 添加小说到书架

**接口信息**:
- **Method**: POST
- **URL**: `/api/bookshelf`
- **Auth**: Required

**请求体**:
```json
{
  "novelId": "nv_001",
  "category": "reading"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-010-1 | 正常添加 | 201，添加成功 |
| TC-API-BS-010-2 | 小说已在书架 | 409，重复添加 |
| TC-API-BS-010-3 | 小说不存在 | 404，小说不存在 |
| TC-API-BS-010-4 | 书架已满(500) | 422，书架已满 |
| TC-API-BS-010-5 | 未登录 | 401，需要登录 |

---

### TC-API-BS-011: 从书架移除小说

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/bookshelf/:novelId`
- **Auth**: Required

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-011-1 | 正常移除 | 204，移除成功 |
| TC-API-BS-011-2 | 小说不在书架 | 404，未找到 |
| TC-API-BS-011-3 | 未登录 | 401，需要登录 |

---

### TC-API-BS-012: 批量移除

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/bookshelf/batch`
- **Auth**: Required

**请求体**:
```json
{
  "novelIds": ["nv_001", "nv_002", "nv_003"]
}
```

---

## 3. 阅读进度接口

### TC-API-BS-020: 更新阅读进度

**接口信息**:
- **Method**: PUT
- **URL**: `/api/bookshelf/:novelId/progress`
- **Auth**: Required

**请求体**:
```json
{
  "chapterId": "ch_050",
  "position": 1500,
  "percent": 45.5
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-020-1 | 正常更新 | 200，更新成功 |
| TC-API-BS-020-2 | 小说不在书架 | 404，未找到 |
| TC-API-BS-020-3 | 无效进度值 | 400，参数错误 |
| TC-API-BS-020-4 | 章节不存在 | 404，章节不存在 |

---

### TC-API-BS-021: 获取阅读进度

**接口信息**:
- **Method**: GET
- **URL**: `/api/bookshelf/:novelId/progress`
- **Auth**: Required

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "novelId": "nv_001",
    "chapterId": "ch_050",
    "chapterTitle": "第五十章",
    "position": 1500,
    "percent": 45.5,
    "updatedAt": "2026-04-12T09:00:00Z"
  }
}
```

---

## 4. 收藏接口

### TC-API-BS-030: 收藏/取消收藏

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/bookshelf/:novelId/favorite`
- **Auth**: Required

**请求体**:
```json
{
  "isFavorite": true
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-030-1 | 收藏小说 | 200，收藏成功 |
| TC-API-BS-030-2 | 取消收藏 | 200，取消成功 |
| TC-API-BS-030-3 | 小说不在书架 | 404，未找到 |

---

## 5. 书架分类接口

### TC-API-BS-040: 获取分类列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/bookshelf/categories`
- **Auth**: Required

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "id": "default", "name": "默认", "count": 30 },
    { "id": "reading", "name": "在读", "count": 10 },
    { "id": "completed", "name": "已读完", "count": 15 },
    { "id": "dropped", "name": "弃坑", "count": 5 }
  ]
}
```

---

### TC-API-BS-041: 创建自定义分类

**接口信息**:
- **Method**: POST
- **URL**: `/api/bookshelf/categories`
- **Auth**: Required

**请求体**:
```json
{
  "name": "我的收藏"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-BS-041-1 | 正常创建 | 201，创建成功 |
| TC-API-BS-041-2 | 分类名重复 | 409，已存在 |
| TC-API-BS-041-3 | 分类数量超限(10) | 422，数量超限 |
| TC-API-BS-041-4 | 名称过长 | 400，参数错误 |

---

**编制**: 测试团队  
**更新**: 2026-04-12
