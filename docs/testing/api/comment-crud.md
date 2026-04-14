# NovelHub 评论系统 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 评论创建接口

### TC-API-CM-001: 发表评论

**接口信息**:
- **Method**: POST
- **URL**: `/api/novels/:novelId/comments`
- **Auth**: Required

**请求体**:
```json
{
  "content": "写得真好，期待后续！",
  "rating": 5,
  "parentId": null
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-001-1 | 正常评论 | 201，评论成功 |
| TC-API-CM-001-2 | 评论内容为空 | 400，内容不能为空 |
| TC-API-CM-001-3 | 评论内容过短(<5) | 400，内容过短 |
| TC-API-CM-001-4 | 评论内容过长(>2000) | 400，内容过长 |
| TC-API-CM-001-5 | 评分范围错误 | 400，评分1-5 |
| TC-API-CM-001-6 | 包含敏感词 | 400，包含违规内容 |
| TC-API-CM-001-7 | 评论频率过快 | 429，请稍后再试 |
| TC-API-CM-001-8 | 未登录 | 401，需要登录 |
| TC-API-CM-001-9 | 评论自己的小说 | 403，不能评论自己的作品 |

---

### TC-API-CM-002: 回复评论

**接口信息**:
- **Method**: POST
- **URL**: `/api/comments/:commentId/replies`
- **Auth**: Required

**请求体**:
```json
{
  "content": "感谢支持！"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-002-1 | 正常回复 | 201，回复成功 |
| TC-API-CM-002-2 | 回复不存在评论 | 404，评论不存在 |
| TC-API-CM-002-3 | 回复已删除评论 | 410，评论已删除 |
| TC-API-CM-002-4 | 楼中楼层级超限 | 400，最多3层 |

---

## 2. 评论查询接口

### TC-API-CM-010: 获取小说评论列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/novels/:novelId/comments`
- **Auth**: Optional

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "sort": "hot",
  "order": "desc",
  "filter": "all"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "cm_001",
      "user": {
        "id": "usr_001",
        "username": "reader1",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": "写得真好！",
      "rating": 5,
      "likeCount": 100,
      "replyCount": 10,
      "isLiked": false,
      "createdAt": "2026-04-12T10:00:00Z",
      "replies": [
        {
          "id": "cm_002",
          "user": {
            "id": "usr_002",
            "username": "author1"
          },
          "content": "感谢支持！",
          "parentId": "cm_001",
          "createdAt": "2026-04-12T10:05:00Z"
        }
      ]
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 500
    },
    "stats": {
      "total": 500,
      "rating": 4.8,
      "ratingCount": {
        "5": 400,
        "4": 80,
        "3": 15,
        "2": 3,
        "1": 2
      }
    }
  }
}
```

---

### TC-API-CM-011: 获取评论详情

**接口信息**:
- **Method**: GET
- **URL**: `/api/comments/:id`
- **Auth**: Optional

---

### TC-API-CM-012: 获取回复列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/comments/:commentId/replies`
- **Auth**: Optional

---

## 3. 评论更新接口

### TC-API-CM-020: 编辑评论

**接口信息**:
- **Method**: PUT
- **URL**: `/api/comments/:id`
- **Auth**: Required (Owner)

**请求体**:
```json
{
  "content": "修改后的评论内容"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-020-1 | 正常编辑 | 200，编辑成功 |
| TC-API-CM-020-2 | 超过编辑时限(24h) | 403，超过编辑时限 |
| TC-API-CM-020-3 | 非作者编辑 | 403，无权操作 |
| TC-API-CM-020-4 | 评论已被回复 | 403，已有回复不能编辑 |

---

## 4. 评论删除接口

### TC-API-CM-030: 删除评论

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/comments/:id`
- **Auth**: Required (Owner/Admin)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-030-1 | 作者删除 | 204，删除成功 |
| TC-API-CM-030-2 | 管理员删除 | 204，删除成功 |
| TC-API-CM-030-3 | 非作者删除 | 403，无权操作 |
| TC-API-CM-030-4 | 评论不存在 | 404，评论不存在 |

---

## 5. 评论互动接口

### TC-API-CM-040: 点赞评论

**接口信息**:
- **Method**: POST
- **URL**: `/api/comments/:id/like`
- **Auth**: Required

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-040-1 | 正常点赞 | 200，点赞成功 |
| TC-API-CM-040-2 | 重复点赞 | 409，已点赞 |
| TC-API-CM-040-3 | 评论不存在 | 404，评论不存在 |
| TC-API-CM-040-4 | 未登录 | 401，需要登录 |

---

### TC-API-CM-041: 取消点赞

**接口信息**:
- **Method**: DELETE
- **URL**: `/api/comments/:id/like`
- **Auth**: Required

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-CM-041-1 | 正常取消 | 204，取消成功 |
| TC-API-CM-041-2 | 未点赞 | 400，未点赞 |
| TC-API-CM-041-3 | 未登录 | 401，需要登录 |

---

### TC-API-CM-042: 举报评论

**接口信息**:
- **Method**: POST
- **URL**: `/api/comments/:id/report`
- **Auth**: Required

**请求体**:
```json
{
  "reason": "spam",
  "description": "垃圾广告"
}
```

---

## 6. 评论管理接口

### TC-API-CM-050: 获取我的评论

**接口信息**:
- **Method**: GET
- **URL**: `/api/users/me/comments`
- **Auth**: Required

---

### TC-API-CM-051: 获取收到的回复

**接口信息**:
- **Method**: GET
- **URL**: `/api/users/me/replies`
- **Auth**: Required

---

**编制**: 测试团队  
**更新**: 2026-04-12
