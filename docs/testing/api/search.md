# NovelHub 搜索 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 关键词搜索

### TC-API-SEARCH-001: 搜索小说

**接口信息**:
- **Method**: GET
- **URL**: `/api/search`
- **Auth**: Optional

**请求参数**:
```json
{
  "q": "修仙",
  "page": 1,
  "pageSize": 20,
  "category": "仙侠",
  "status": "ongoing",
  "sort": "relevance"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-SEARCH-001-1 | 正常搜索 | 200，返回结果列表 |
| TC-API-SEARCH-001-2 | 关键词为空 | 400，关键词必填 |
| TC-API-SEARCH-001-3 | 关键词过短(<2) | 400，关键词过短 |
| TC-API-SEARCH-001-4 | 无结果 | 200，返回空列表 |
| TC-API-SEARCH-001-5 | 搜索频率过快 | 429，请稍后再试 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "nv_001",
      "title": "修仙传奇",
      "cover": "https://example.com/cover.jpg",
      "author": "author1",
      "category": "仙侠",
      "wordCount": 100000,
      "highlight": "这是一本<em>修仙</em>小说"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    },
    "searchTime": 50
  }
}
```

---

## 2. 热门搜索

### TC-API-SEARCH-010: 获取热门搜索

**接口信息**:
- **Method**: GET
- **URL**: `/api/search/hot`
- **Auth**: Optional

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "keyword": "修仙", "count": 10000 },
    { "keyword": "都市", "count": 8000 },
    { "keyword": "玄幻", "count": 6000 }
  ]
}
```

---

## 3. 搜索建议

### TC-API-SEARCH-020: 获取搜索建议

**接口信息**:
- **Method**: GET
- **URL**: `/api/search/suggestions`
- **Auth**: Optional

**请求参数**:
```json
{
  "q": "修"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    "修仙",
    "修仙传",
    "修仙世界",
    "修真"
  ]
}
```

---

**编制**: 测试团队  
**更新**: 2026-04-12
