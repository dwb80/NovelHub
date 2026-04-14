# NovelHub 管理后台 API 测试用例

**版本**: v1.0  
**更新日期**: 2026-04-12

---

## 1. 用户管理接口

### TC-API-ADM-001: 获取用户列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/admin/users`
- **Auth**: Required (Admin)

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "keyword": "test",
  "status": "active",
  "role": "author",
  "sort": "createdAt",
  "order": "desc"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-001-1 | 正常获取用户列表 | 200，返回用户列表 |
| TC-API-ADM-001-2 | 带关键词搜索 | 200，返回匹配用户 |
| TC-API-ADM-001-3 | 按角色过滤 | 200，返回指定角色用户 |
| TC-API-ADM-001-4 | 无权限访问 | 403，权限不足 |
| TC-API-ADM-001-5 | 分页参数边界 | 200，正确处理分页 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "usr_001",
      "username": "testuser",
      "email": "test@example.com",
      "role": "author",
      "status": "active",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLoginAt": "2026-04-12T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

---

### TC-API-ADM-002: 获取用户详情

**接口信息**:
- **Method**: GET
- **URL**: `/api/admin/users/:id`
- **Auth**: Required (Admin)

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-002-1 | 获取存在的用户 | 200，返回用户详情 |
| TC-API-ADM-002-2 | 获取不存在的用户 | 404，用户不存在 |
| TC-API-ADM-002-3 | 无效的用户ID | 400，参数错误 |
| TC-API-ADM-002-4 | 无权限访问 | 403，权限不足 |

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "usr_001",
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "role": "author",
    "status": "active",
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "作者简介"
    },
    "stats": {
      "novelCount": 5,
      "totalWordCount": 500000,
      "followerCount": 1000
    },
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-04-12T10:00:00Z"
  }
}
```

---

### TC-API-ADM-003: 更新用户状态

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/admin/users/:id/status`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "status": "banned",
  "reason": "违规操作",
  "banDuration": 7
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-003-1 | 正常封禁用户 | 200，状态更新成功 |
| TC-API-ADM-003-2 | 解封用户 | 200，状态更新成功 |
| TC-API-ADM-003-3 | 无效的状态值 | 400，参数错误 |
| TC-API-ADM-003-4 | 封禁超级管理员 | 403，无权操作 |
| TC-API-ADM-003-5 | 用户不存在 | 404，用户不存在 |

---

### TC-API-ADM-004: 更新用户角色

**接口信息**:
- **Method**: PATCH
- **URL**: `/api/admin/users/:id/role`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "role": "author"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-004-1 | 正常更新角色 | 200，角色更新成功 |
| TC-API-ADM-004-2 | 无效的角色值 | 400，参数错误 |
| TC-API-ADM-004-3 | 降级超级管理员 | 403，无权操作 |
| TC-API-ADM-004-4 | 用户不存在 | 404，用户不存在 |

---

## 2. 内容审核接口

### TC-API-ADM-010: 获取待审核小说列表

**接口信息**:
- **Method**: GET
- **URL**: `/api/admin/review/novels`
- **Auth**: Required (Admin)

**请求参数**:
```json
{
  "page": 1,
  "pageSize": 20,
  "status": "pending",
  "category": "仙侠",
  "submitStartDate": "2026-04-01",
  "submitEndDate": "2026-04-12"
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-010-1 | 正常获取待审核列表 | 200，返回列表 |
| TC-API-ADM-010-2 | 按状态过滤 | 200，返回指定状态 |
| TC-API-ADM-010-3 | 按日期范围过滤 | 200，返回范围内数据 |
| TC-API-ADM-010-4 | 无权限访问 | 403，权限不足 |

---

### TC-API-ADM-011: 审核小说

**接口信息**:
- **Method**: POST
- **URL**: `/api/admin/review/novels/:id`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "action": "approve",
  "comment": "审核通过",
  "sensitiveWords": []
}
```

**测试用例**:

| 用例ID | 场景 | 预期结果 |
|--------|------|----------|
| TC-API-ADM-011-1 | 通过审核 | 200，审核成功，小说状态更新 |
| TC-API-ADM-011-2 | 驳回审核 | 200，审核成功，小说状态更新 |
| TC-API-ADM-011-3 | 需要修改 | 200，审核成功，返回修改建议 |
| TC-API-ADM-011-4 | 无效的操作 | 400，参数错误 |
| TC-API-ADM-011-5 | 小说不存在 | 404，小说不存在 |
| TC-API-ADM-011-6 | 重复审核 | 409，已审核过 |

---

### TC-API-ADM-012: 批量审核

**接口信息**:
- **Method**: POST
- **URL**: `/api/admin/review/novels/batch`
- **Auth**: Required (Admin)

**请求体**:
```json
{
  "ids": ["nv_001", "nv_002", "nv_003"],
  "action": "approve",
  "comment": "批量审核