# NovelHub 小说管理 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 小说创建接口

### TC-API-NV-001: 创建小说

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "title": "修仙传奇",
  "summary": "一个凡人修仙的故事...",
  "category": "仙侠",
  "tags": ["修仙", "热血", "升级"],
  "cover": "https://example.com/cover.jpg",
  "status": "draft"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-NV-001-1 | 正常创建 | 201，创建成功 |
| TC-API-NV-001-2 | 标题重复 | 409，标题已存在 |
| TC-API-NV-001-3 | 标题过短(<2) | 400，标题过短 |
| TC-API-NV-001-4 | 标题过长(>200) | 400，标题过长 |
| TC-API-NV-001-5 | 简介过长(>2000) | 400，简介过长 |
| TC-API-NV-001-6 | 标签数量超限(>5) | 400，标签过多 |
| TC-API-NV-001-7 | 无效分类 | 400，分类不存在 |
| TC-API-NV-001-8 | 未登录 | 401，需要登录 |
| TC-API-NV-001-9 | 非作者角色 | 403，需要作者权限 |

---

## 2. 小说查询接口

### TC-API-NV-010: 获取小说列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/novels`
- **Auth**: Optional

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "category": "仙侠",
  "status": "ongoing",
  "sort": "update",
  "order": "desc"
}
```

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
      "author": {
        "id": "usr_001",
        "username": "author1"
      },
      "category": "仙侠",
      "summary": "简介...",
      "wordCount": 100000,
      "chapterCount": 50,
      "status": "ongoing",
      "updatedAt": "2026-04-12T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1000
    }
  }
}
```

---

### TC-API-NV-011: 获取小说详情

**接口信息**:
- **Method**: GET
- **URL**: `/api/novels/:id`
- **Auth**: Optional

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-NV-011-1 | 获取已发布小说 | 200，返回详情 |
| TC-API-NV-011-2 | 获取草稿小说(作者) | 200，返回详情 |
| TC-API-NV-011-3 | 获取草稿小说(非作者) | 403，无权访问 |
| TC-API-NV-011-4 | 小说不存在 | 404，小说不存在 |

---

## 3. 小说更新接口

### TC-API-NV-020: 更新小说

**接口信息**:
- **Method**: PUT
- **URL**: `/api/novels/:id`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "title": "修仙传奇（修订版）",
  "summary": "更新后的简介...",
  "category": "玄幻",
  "tags": ["修仙", "热血"],
  "cover": "https://example.com/new-cover.jpg"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-NV-020-1 | 正常更新 | 200，更新成功 |
| TC-API-NV-020-2 | 非作者更新 | 403，无权操作 |
| TC-API-NV-020-3 | 已发布小说改标题 | 200，创建修订 |
| TC-API-NV-020-4 | 小说不存在 | 404，小说不存在 |

---

### TC-API-NV-021: 更新小说状态

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/novels/:id/status`
- **Auth**: Required (Author)

**请求体**:
```json
{
  "status": "completed"
}
```

---

## 4. 小说删除接口

### TC-API-NV-030: 删除小说

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/novels/:id`
- **Auth**: Required (Author/Admin)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-NV-030-1 | 作者删除草稿 | 204，删除成功 |
| TC-API-NV-030-2 | 作者删除已发布 | 204，软删除 |
| TC-API-NV-030-3 | 管理员删除 | 204，删除成功 |
| TC-API-NV-030-4 | 非作者删除 | 403，无权操作 |

---

## 5. 小说发布接口

### TC-API-NV-040: 发布小说

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:id/publish`
- **Auth**: Required (Author)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-NV-040-1 | 正常发布 | 200，发布成功 |
| TC-API-NV-040-2 | 无章节发布 | 422，至少一章 |
| TC-API-NV-040-3 | 非作者发布 | 403，无权操作 |
| TC-API-NV-040-4 | 已发布小说 | 409，已发布 |

---

**编制**: 测试团队  
**更新**: 2026-04-12
